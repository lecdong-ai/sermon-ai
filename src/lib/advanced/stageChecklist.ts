import type { ProjectStatus } from '@/lib/advanced/types'

export interface StageCheckItem {
  id: string
  label: string
  check: (data: any) => boolean
  aiFix?: (data: any) => Promise<any>
}

export interface StageChecklist {
  from: ProjectStatus
  to: ProjectStatus
  items: StageCheckItem[]
  minPassRate: number
}

export const STAGE_CHECKLISTS: StageChecklist[] = [
  {
    from: 'research',
    to: 'prepare',
    minPassRate: 0.7,
    items: [
      {
        id: 'passage-analyzed',
        label: '본문 분석 완료',
        check: (data) => !!data?.passageStructure && data.passageStructure.length > 20,
      },
      {
        id: 'greek-words',
        label: '원어 연구 ≥ 2개',
        check: (data) => Array.isArray(data?.greekWords) && data.greekWords.length >= 2,
      },
      {
        id: 'commentaries',
        label: '주석 ≥ 3개 확인',
        check: (data) => Array.isArray(data?.commentaries) && data.commentaries.length >= 3,
      },
      {
        id: 'themes',
        label: '주제 ≥ 1개 설정',
        check: (data) => Array.isArray(data?.themes) && data.themes.length >= 1,
      },
    ],
  },
  {
    from: 'prepare',
    to: 'writing',
    minPassRate: 0.8,
    items: [
      {
        id: 'core-message',
        label: '중심명제 설정',
        check: (data) => !!data?.coreMessage && data.coreMessage.length > 10,
      },
      {
        id: 'outlines',
        label: '대지 구조 ≥ 2개',
        check: (data) => Array.isArray(data?.outlines) && data.outlines.length >= 2,
      },
      {
        id: 'application-points',
        label: '적용 포인트 ≥ 1개',
        check: (data) => Array.isArray(data?.applicationPoints) && data.applicationPoints.length >= 1,
      },
      {
        id: 'delivery-flow',
        label: '전달 흐름 설정',
        check: (data) => !!data?.deliveryFlow && data.deliveryFlow.length > 10,
      },
    ],
  },
  {
    from: 'writing',
    to: 'review',
    minPassRate: 0.75,
    items: [
      {
        id: 'introduction',
        label: '서론 작성됨',
        check: (data) => {
          const intro = data?.sections?.find((s: any) => s.type === 'introduction')
          return !!intro?.content && intro.content.length > 50
        },
      },
      {
        id: 'body-sections',
        label: '본론 ≥ 2개 작성됨',
        check: (data) => {
          const bodies = data?.sections?.filter((s: any) => s.type === 'body') || []
          return bodies.filter((s: any) => s.content.length > 100).length >= 2
        },
      },
      {
        id: 'conclusion',
        label: '결론 작성됨',
        check: (data) => {
          const concl = data?.sections?.find((s: any) => s.type === 'conclusion')
          return !!concl?.content && concl.content.length > 50
        },
      },
      {
        id: 'application',
        label: '적용 작성됨',
        check: (data) => {
          const app = data?.sections?.find((s: any) => s.type === 'application')
          return !!app?.content && app.content.length > 50
        },
      },
    ],
  },
  {
    from: 'review',
    to: 'completed',
    minPassRate: 0.8,
    items: [
      {
        id: 'word-count',
        label: '원고 분량 ≥ 1000자',
        check: (data) => {
          const total = data?.sections?.reduce((sum: number, s: any) => sum + (s.content?.length || 0), 0) || 0
          return total >= 1000
        },
      },
      {
        id: 'all-sections',
        label: '모든 섹션 내용 있음',
        check: (data) => {
          const sections = data?.sections || []
          return sections.every((s: any) => s.content && s.content.length > 20)
        },
      },
      {
        id: 'illustrations',
        label: '예화 ≥ 1개 포함',
        check: (data) => Array.isArray(data?.illustrationNotes) && data.illustrationNotes.length >= 1,
      },
    ],
  },
]

export function getChecklistForTransition(from: ProjectStatus, to: ProjectStatus): StageChecklist | undefined {
  return STAGE_CHECKLISTS.find(c => c.from === from && c.to === to)
}
