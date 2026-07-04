/* ═══════════════════════════════════════════════════════════
   John 1:1-5 — 설교 준비 및 작성 버전 데이터
   연구 → 준비 → 작성 흐름의 realistic handoff를 반영
   ═══════════════════════════════════════════════════════════ */

export interface PrepVersion {
  id: string
  label: string
  summary: string
  changes: string[]
  isCurrent: boolean
  createdAt: string
  wordCount: number
}

export interface ManuscriptVersion {
  id: string
  label: string
  summary: string
  changes: string[]
  isCurrent: boolean
  createdAt: string
  wordCount: number
  basedOnPrepVersion: string
}

export const PREP_VERSIONS: PrepVersion[] = [
  {
    id: 'prep-v3',
    label: '작성 전달용 준비본',
    summary: '도입·결론 방향 정리, 전달 흐름 메모 완료, 작성 단계로 전달 준비 완료',
    changes: [
      '도입 방향 메모 추가 — "익숙한 본문을 가장 신선하게 전하는 방법"',
      '결론 방향 및 초청 문구 메모 추가',
      '전환 지점 4개 정리 (도입→1대지 / 1→2 / 2→3 / 3→결론)',
      '각 대지의 적용 메모 보완 — 회중 그룹별 구체화',
      '중심명제 최종 확정: "태초부터 계신 말씀은 생명과 빛으로 어둠 속의 사람을 비추신다"',
    ],
    isCurrent: true,
    createdAt: '2026-06-11T14:30:00Z',
    wordCount: 3240,
  },
  {
    id: 'prep-v2',
    label: '구조 정리본',
    summary: '대지 3개 확정, 적용 메모 4개 추가, 핵심 원어 정리',
    changes: [
      '대지 3개 구조 확정 — 선재성(1-2절) → 생명과 창조(3-4절) → 빛과 어둠(5절)',
      '각 대지 설명 보강 — 본문 유관절 연결',
      '적용 메모 4개 추가 — 전체 회중/신앙 성숙자/고난 중인 성도/새가족',
      '핵심 원어 5개 정리 — λόγος, ζωή, φῶς, σκοτία, σάρξ',
      '설교 목적 문장 구체화 — "회중이 예수 그리스도를 생명과 빛의 주로 다시 바라보게 한다"',
    ],
    isCurrent: false,
    createdAt: '2026-06-11T11:30:00Z',
    wordCount: 2180,
  },
  {
    id: 'prep-v1',
    label: '준비 초안',
    summary: '중심명제 초안 작성, 대지 2개 기초 정리, 연구 통찰 반영 시작',
    changes: [
      '중심명제 초안: "말씀은 생명이요 빛이시다"',
      '대지 2개 기초 정리 — 1대지(말씀의 선재성), 2대지(생명의 근원)',
      '연구 통찰 4개 반영 — 창세기 연결, 로고스 신학, 중의적 의미, 초기 교회 찬송',
      '문맥 포인트 4개 정리 — 창세기 인용, 요한 공동체 상황, 영지주의 반박, 시내산 대비',
      '본문 구조 요약 작성 — 선재성 → 창조와 생명 → 빛과 어둠',
    ],
    isCurrent: false,
    createdAt: '2026-06-10T20:30:00Z',
    wordCount: 1240,
  },
]

export const MANUSCRIPT_VERSIONS: ManuscriptVersion[] = [
  {
    id: 'ms-v3',
    label: '주일 설교본',
    summary: '결론 정리 및 전달 흐름 반영, 최종 검토 완료',
    changes: [
      '결론 단락 재구성 — 중심명제 재진언 및 회중 초청 문장 추가',
      '전달 흐름에 맞춰 도입 문장 다듬기',
      '대지 간 전환 문장 보강 (준비 전달 메모 반영)',
      '적용 문장을 각 대지 안에 통합 — 자연스러운 흐름',
      '분량 조정 및 문장 다듬기',
    ],
    isCurrent: true,
    createdAt: '2026-06-11T15:20:00Z',
    wordCount: 4560,
    basedOnPrepVersion: '작성 전달용 준비본 v3',
  },
  {
    id: 'ms-v2',
    label: '수정본',
    summary: '2·3대지 확장, 적용 문장 추가, 준비 적용 포인트 반영',
    changes: [
      '2대지(말씀 안의 생명) 원고 확장 — 창조와 생명 연결성 강화',
      '3대지(빛과 어둠) 원고 작성 — 어둠의 중의적 의미(이해/정복) 반영',
      '준비 단계의 적용 포인트 4개를 각 대지에 분산 배치',
      '도입 문장 보강 — "태초에"의 무게감을 살리는 방향으로',
      '원어 삽입 — λόγος·ζωή·φῶς 설명 문장 추가',
    ],
    isCurrent: false,
    createdAt: '2026-06-11T13:00:00Z',
    wordCount: 3820,
    basedOnPrepVersion: '구조 정리본 v2',
  },
  {
    id: 'ms-v1',
    label: '초안',
    summary: '도입 및 1대지 중심의 첫 원고, 준비 구조 v3 기반',
    changes: [
      '도입 단락 작성 — "태초에 말씀이 계시니라"의 장엄함을 살린 opening',
      '1대지(말씀의 선재성) 원고 초안 — ἐν ἀρχῇ의 의미 전개',
      '설교 제목 가안: "말씀은 생명이요 빛이시다"',
      '요한 1:1-5 병렬 본문 참조하여 문장 구성',
      '일부 원어(λόγος, ζωή) 설명 포함',
    ],
    isCurrent: false,
    createdAt: '2026-06-11T10:00:00Z',
    wordCount: 2140,
    basedOnPrepVersion: '작성 전달용 준비본 v3',
  },
]

export const RECENT_ACTIVITY: { time: string; description: string; section: 'prep' | 'manuscript' | 'study' }[] = [
  { time: '오전 8:55', description: '중심명제 문장 다듬음', section: 'prep' },
  { time: '오전 9:17', description: '대지 3 적용 메모 추가 — "어둠이 깊을수록 빛은 더 선명하다"', section: 'prep' },
  { time: '오전 10:06', description: '도입 초안 작성 — "태초에"의 의미 전개', section: 'manuscript' },
  { time: '오전 10:41', description: '결론 구획 수정 — 중심명제 재진언 방향으로', section: 'manuscript' },
  { time: '오전 11:14', description: '대지 2대지 원고 확장 — 생명(ζωή)의 의미 보강', section: 'manuscript' },
]
