import { Sermon, Theme, Series, GraphNode, GraphLink, GraphData } from './types'
import { GRAPH_COLORS } from './constants'

export function buildGraphData(
  sermons: Sermon[],
  themes: Theme[],
  series: Series[],
  filters?: {
    themeIds?: string[]
    seasons?: string[]
    audiences?: string[]
    seriesIds?: string[]
    book?: string
  }
): GraphData {
  const nodesMap = new Map<string, GraphNode>()
  const links: GraphLink[] = []
  const linkSet = new Set<string>()

  function addNode(id: string, label: string, type: GraphNode['type'], sermonCount = 0) {
    if (!nodesMap.has(id)) {
      nodesMap.set(id, {
        id,
        label,
        type,
        color: GRAPH_COLORS[type],
        size: type === 'sermon' ? 6 : type === 'passage' ? 5 : 4,
        sermonCount,
      })
    }
  }

  function addLink(source: string, target: string, type: string) {
    const key = `${source}-${target}`
    const revKey = `${target}-${source}`
    if (!linkSet.has(key) && !linkSet.has(revKey)) {
      linkSet.add(key)
      links.push({ source, target, type })
    }
  }

  let filteredSermons = sermons
  if (filters) {
    if (filters.themeIds && filters.themeIds.length > 0) {
      filteredSermons = filteredSermons.filter((s) =>
        s.themeIds.some((tid) => filters.themeIds!.includes(tid))
      )
    }
    if (filters.seasons && filters.seasons.length > 0) {
      filteredSermons = filteredSermons.filter((s) =>
        filters.seasons!.includes(s.season)
      )
    }
    if (filters.audiences && filters.audiences.length > 0) {
      filteredSermons = filteredSermons.filter((s) =>
        filters.audiences!.includes(s.audience)
      )
    }
    if (filters.seriesIds && filters.seriesIds.length > 0) {
      filteredSermons = filteredSermons.filter((s) =>
        filters.seriesIds!.includes(s.seriesId)
      )
    }
    if (filters.book) {
      filteredSermons = filteredSermons.filter((s) =>
        s.bibleBook === filters.book
      )
    }
  }

  for (const sermon of filteredSermons) {
    addNode(`sermon-${sermon.id}`, sermon.title || '(제목 없음)', 'sermon')

    // Passage node — use full verse range for unique ID
    if (sermon.bibleBook && sermon.chapterStart) {
      const vs = sermon.verseStart || 1
      const ve = sermon.verseEnd || vs
      const passageId = `passage-${sermon.bibleBook}-${sermon.chapterStart}-${vs}-${ve}`
      addNode(passageId, sermon.normalizedPassage || `${sermon.bibleBook} ${sermon.chapterStart}:${vs}${ve !== vs ? '-' + ve : ''}`, 'passage')
      addLink(`sermon-${sermon.id}`, passageId, 'passage')
    }

    for (const themeId of sermon.themeIds) {
      const theme = themes.find((t) => t.id === themeId)
      if (theme) {
        addNode(`theme-${theme.id}`, theme.name, 'theme')
        addLink(`sermon-${sermon.id}`, `theme-${theme.id}`, 'theme')
      }
    }

    if (sermon.season) {
      const seasonId = `season-${sermon.season}`
      addNode(seasonId, sermon.season, 'season')
      addLink(`sermon-${sermon.id}`, seasonId, 'season')
    }

    if (sermon.audience) {
      const audienceId = `audience-${sermon.audience}`
      addNode(audienceId, sermon.audience, 'audience')
      addLink(`sermon-${sermon.id}`, audienceId, 'audience')
    }

    if (sermon.seriesId) {
      const srs = series.find((s) => s.id === sermon.seriesId)
      if (srs) {
        addNode(`series-${srs.id}`, srs.name, 'series')
        addLink(`sermon-${sermon.id}`, `series-${srs.id}`, 'series')
      }
    }

    for (const relatedId of sermon.relatedSermonIds) {
      const related = sermons.find((s) => s.id === relatedId)
      if (related) {
        addLink(
          `sermon-${sermon.id}`,
          `sermon-${related.id}`,
          'related'
        )
      }
    }
  }

  const nodes = Array.from(nodesMap.values())

  for (const node of nodes) {
    if (node.type !== 'sermon') {
      const count = links.filter(
        (l) =>
          (l.source === node.id || l.target === node.id) &&
          (typeof l.source === 'string' ? l.source.startsWith('sermon-') : false)
      ).length
      node.sermonCount = count
    }
  }

  return { nodes, links }
}

export function buildSermonCentricGraph(
  sermonId: string,
  sermons: Sermon[],
  themes: Theme[],
  series: Series[],
  depth: number = 1
): GraphData {
  const mainSermon = sermons.find((s) => s.id === sermonId)
  if (!mainSermon) return { nodes: [], links: [] }

  const relevantIds = new Set<string>([sermonId])
  const queue = [sermonId]

  for (let d = 0; d < depth; d++) {
    const current = queue.shift()
    if (!current) break
    const sermon = sermons.find((s) => s.id === current)
    if (!sermon) continue

    for (const rid of sermon.relatedSermonIds) {
      if (!relevantIds.has(rid)) {
        relevantIds.add(rid)
        queue.push(rid)
      }
    }
  }

  const relevantSermons = sermons.filter((s) => relevantIds.has(s.id))

  return buildGraphData(relevantSermons, themes, series)
}
