import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { NODE_COLORS, NODE_LABELS } from '@/lib/advanced/graphData'
import type { GraphNode, GraphEdge } from '@/lib/advanced/graphData'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const [sermonsRes, seriesRes] = await Promise.all([
      supabaseAdmin
        .from('sermons')
        .select('id, title, book, passage, chapter_start, chapter_end, verse_start, verse_end, season, series, status, result, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false }),
      supabaseAdmin
        .from('series')
        .select('id, name, description, status')
        .eq('user_id', user.id),
    ])

    if (sermonsRes.error) throw sermonsRes.error

    const sermons = sermonsRes.data || []
    const seriesList = seriesRes.data || []
    const nodesMap = new Map<string, GraphNode>()
    const edges: GraphEdge[] = []
    const edgeSet = new Set<string>()

    const addNode = (id: string, label: string, type: GraphNode['type'], subtitle: string, detail: string, size?: number) => {
      if (!nodesMap.has(id)) {
        nodesMap.set(id, { id, label, type, subtitle, detail, size: size || (type === 'sermon' ? 5 : 4) })
      }
    }

    const addEdge = (source: string, target: string, label: string, weight = 1) => {
      const key = `${source}::${target}`
      const rev = `${target}::${source}`
      if (!edgeSet.has(key) && !edgeSet.has(rev)) {
        edgeSet.add(key)
        edges.push({ source, target, label, weight })
      }
    }

    // Track unique passages and themes
    const passageSet = new Map<string, { label: string; count: number }>()
    const themeSet = new Map<string, { name: string; count: number }>()

    for (const sermon of sermons) {
      const result = sermon.result || {}
      const sermonId = `sermon-${sermon.id}`
      const subtitle = sermon.passage || result.preacher ? `${result.preacher} · ${sermon.passage || ''}` : sermon.status || ''
      addNode(sermonId, sermon.title || '(제목 없음)', 'sermon', subtitle, sermon.passage || '', 5)

      // Passage
      if (sermon.book && sermon.chapter_start) {
        const vs = sermon.verse_start || 1
        const ve = sermon.verse_end || vs
        const passageId = `passage-${sermon.book}-${sermon.chapter_start}`
        const passageLabel = sermon.passage || `${sermon.book} ${sermon.chapter_start}:${vs}${ve !== vs ? '-' + ve : ''}`
        if (!passageSet.has(passageId)) {
          passageSet.set(passageId, { label: passageLabel, count: 0 })
        }
        passageSet.get(passageId)!.count++
        addNode(passageId, passageLabel, 'passage', `${sermon.book}`, `${sermon.book} ${sermon.chapter_start}장`, 4)
        addEdge(sermonId, passageId, '본문', 2)
      }

      // Themes
      const themeNames: string[] = result.themeNames || []
      const themeIds: string[] = result.themeIds || []
      const seen = new Set<string>()
      const allThemes = [...themeNames, ...themeIds].filter(t => { const dup = seen.has(t); seen.add(t); return !dup && t })
      for (const theme of allThemes) {
        if (!theme) continue
        const themeId = `theme-${theme}`
        if (!themeSet.has(themeId)) {
          themeSet.set(themeId, { name: theme, count: 0 })
        }
        themeSet.get(themeId)!.count++
        addNode(themeId, theme, 'theme', '주제', `연결된 설교: ${themeSet.get(themeId)?.count || 1}개`, 4)
        addEdge(sermonId, themeId, '관련')
      }

      // Season
      if (sermon.season) {
        const seasonId = `season-${sermon.season}`
        addNode(seasonId, sermon.season, 'theme', '시즌', `${sermon.season} 시즌`, 3)
        addEdge(sermonId, seasonId, '강조')
      }

      // Series
      if (result.seriesId) {
        const found = seriesList.find(s => s.id === result.seriesId)
        if (found) {
          const seriesNodeId = `series-${found.id}`
          addNode(seriesNodeId, found.name, 'series', found.description || '시리즈', found.status || 'active', 4)
          addEdge(sermonId, seriesNodeId, '소속')
        }
      } else if (sermon.series) {
        const seriesNodeId = `series-${sermon.series}`
        addNode(seriesNodeId, sermon.series, 'series', '', '시리즈', 4)
        addEdge(sermonId, seriesNodeId, '소속')
      }

      // Related sermons
      const relatedIds: string[] = result.relatedSermonIds || []
      for (const rid of relatedIds) {
        const relSermon = sermons.find(s => s.id === rid)
        if (relSermon) {
          addEdge(sermonId, `sermon-${rid}`, '참조', 1)
        }
      }
    }

    // Update theme node details with final counts
    themeSet.forEach((info, id) => {
      const node = nodesMap.get(id)
      if (node) {
        node.detail = `연결된 설교: ${info.count}개`
      }
    })

    // Series level: add series node if not already added from sermon reference
    for (const series of seriesList) {
      const seriesNodeId = `series-${series.id}`
      if (!nodesMap.has(seriesNodeId)) {
        addNode(seriesNodeId, series.name, 'series', series.description || '', series.status || 'active', 4)
      }
    }

    const nodes: GraphNode[] = []
    nodesMap.forEach(n => nodes.push(n))

    return NextResponse.json({
      success: true,
      data: { nodes, edges },
    })
  } catch (err: any) {
    console.error('GET /api/graph error:', err)
    return NextResponse.json({ success: false, error: err.message || '그래프 데이터 조회 실패' }, { status: 500 })
  }
}
