export type ExpositoryModelId = 'pastoral' | 'deep' | 'textual'

export interface ExpositoryModel {
  id: ExpositoryModelId
  styleKey: 'park_youngsun' | 'lloyd_jones' | 'john_piper'
  label: string
  reference: string
  description: string
  sectionsPerSermon: number
}

// 유명 강해자의 실제 설교 회차를 복제하는 값이 아니라, 강해의 깊이와
// 본문을 다루는 경향을 책의 소제목 밀도에 적용하기 위한 계획 모델입니다.
export const EXPOSITORY_MODELS: ExpositoryModel[] = [
  {
    id: 'pastoral',
    styleKey: 'park_youngsun',
    label: '목양적 균형 강해',
    reference: '박영선 목사 강해 경향 참고',
    description: '본문의 큰 흐름을 놓치지 않으면서 성도의 삶과 성숙까지 연결합니다.',
    sectionsPerSermon: 1.8,
  },
  {
    id: 'deep',
    styleKey: 'lloyd_jones',
    label: '정밀 본문 강해',
    reference: '마틴 로이드 존스 목사 강해 경향 참고',
    description: '한 단락을 오래 머물며 교리적 깊이와 구속사적 의미를 촘촘히 살핍니다.',
    sectionsPerSermon: 1,
  },
  {
    id: 'textual',
    styleKey: 'john_piper',
    label: '본문 중심 복음 강해',
    reference: '존 파이퍼 목사 강해 경향 참고',
    description: '본문의 논리와 흐름을 따라가며 하나님을 기뻐하는 복음의 열정으로 연결합니다.',
    sectionsPerSermon: 1.35,
  },
]

export function getExpositoryModel(id?: string): ExpositoryModel {
  return EXPOSITORY_MODELS.find(model => model.id === id) || EXPOSITORY_MODELS[0]
}

export function getRecommendedTargetCount(sectionCount: number, modelId?: string): number {
  const model = getExpositoryModel(modelId)
  return Math.max(1, Math.min(72, Math.min(sectionCount, Math.round(sectionCount / model.sectionsPerSermon))))
}
