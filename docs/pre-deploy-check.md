# 배포 전 최종 점검 프롬프트

> 5개 탭(study / prep / manuscript / versions / connections) + 대시보드를 **사용자 관점에서 모두 검증**합니다.
> 최종 polish 완료 후, 배포 직전 단 한 번만 실행하세요.

---

## 1. 빌드

```
npm run build
```

- [ ] 에러 0건, 경고는 pre-existing만 허용 (graph 페이지 useEffect deps 경고 외에는 없어야 함)
- [ ] `.next` 충돌 방지: 대규모 수정 후에는 `rm -rf .next && npm run build`

---

## 2. HTTP 200 검증 (5개 탭 + 대시보드 + 그래프)

```
npm run dev -- -p 3001
```

| 페이지 | URL | 상태 |
|--------|-----|------|
| 대시보드 | `/advanced` | 200 |
| 프로젝트 개요 | `/advanced/projects/test-001?tab=overview` | 200 |
| 성경 연구 | `/advanced/projects/test-001?tab=study` | 200 |
| 설교 준비 | `/advanced/projects/test-001?tab=prep` | 200 |
| 설교 작성 | `/advanced/projects/test-001?tab=manuscript` | 200 |
| 버전 기록 | `/advanced/projects/test-001?tab=versions` | 200 |
| 연결 보기 | `/advanced/projects/test-001?tab=connections` | 200 |
| 그래프 | `/advanced/graph` | 200 |
| 프로젝트 목록 | `/advanced/projects` | 200 |
| 시리즈 목록 | `/advanced/series` | 200 |

- [ ] 전 페이지 200 OK
- [ ] 페이지 전환 시 _next/static/chunk 404 없음
- [ ] 콘솔에 React 경고/에러 없음

---

## 3. 시각적 일관성

- [ ] header / card / button 스타일이 페이지마다 통일됨
- [ ] `shadow-sm`이 SaaS 느낌의 카드에 사용되지 않음 (active state small element shadow는 허용)
- [ ] 폰트 계층: 제목(`font-serif bold`), 본문(`text-sm text-paper-700`), 라벨(`text-[10px] text-paper-400 uppercase tracking-widest`)이 일관됨
- [ ] 컬러 사용: 녹색=진행/완료, 테*col*청록=연구, 황색=준비, 청색=적용, 보라=전달, 적색=경고
- [ ] 이모지(📖🔗💡⚠️ 등)가 사용되지 않음 — 모두 SVG 아이콘으로 대체
- [ ] 빈 상태(empty state)가 모든 섹션에 적절히 표시됨

---

## 4. 정보 계층 & 콘텐츠 균형

- [ ] 메인 작업 영역(study / prep / manuscript)이 화면의 대부분을 차지함
- [ ] 우측 패널(BibleStudyTab RightPanel, ManuscriptTab PrepSummaryPanel)은 보조적이며 본문을 압도하지 않음
- [ ] 좌측 네비게이터(PrepTab section nav, ManuscriptTab outline nav)는 접근성을 위한 보조 도구로 작동
- [ ] StageFlowIndicator / ProjectContextRow가 모든 작업 탭 상단에 동일한 형태로 노출됨
- [ ] CTA 우선순위: 초록 채움 버튼(primary) → 테두리 버튼(secondary) → 텍스트 링크(tertiary) 순

---

## 5. 데이터 흐름 (study → prep → manuscript)

- [ ] 연구 탭의 ResearchSummaryForPrep에 실제 연구 데이터(반복 주제, 핵심 통찰, 원어, 적용 질문)가 표시됨
- [ ] “설교 준비로 보내기” CTA가 `/projects/{id}?tab=prep`으로 이동
- [ ] 준비 탭 PassageFlowSection의 “연구에서 가져온 내용” 배너에 연구 내용이 반영됨
- [ ] 준비 탭의 성공 상태(allRequiredDone)가 manuscript 이동 버튼 활성화 조건과 일치
- [ ] 원고 탭 PrepSummaryPanel에 “준비 단계에서 전달된 구조”가 표시됨
- [ ] 대지 구조, 적용 포인트, 원어 정보가 연구→준비→원고로 전달됨

---

## 6. 버전 · 활동 데이터

- [ ] johnVersionData.ts의 PREP_VERSIONS(3개)가 PrepTab PrepVersionHistory에 표시됨
- [ ] MANUSCRIPT_VERSIONS(3개)가 ManuscriptTab 기준본 배지 + WritingStatusBar에 표시됨
- [ ] RECENT_ACTIVITY(5개 항목)가 PrepTab RecentPrepActivity + ManuscriptTab ManuscriptRecentActivity에 표시됨
- [ ] 각 활동 항목의 section 구분(연구/준비/작성)과 dot 색상이 일치함
- [ ] VersionHistoryDrawer가 OverviewTab과 ManuscriptTab에서 모두 정상 작동

---

## 7. StageFlowIndicator

- [ ] 대시보드 제외, 모든 프로젝트 페이지 상단에 표시됨
- [ ] study / prep / manuscript 세 단계 pill이 모두 보임
- [ ] 현재 단계가 강조(active) 표시됨
- [ ] 완료된 단계에 체크 표시 또는 채워진 dot
- [ ] 각 pill 클릭 시 해당 탭으로 라우팅됨
- [ ] stageStatus 전달이 실제 탭 위치와 일치함 (예: manuscript 탭에서 study:'done', prep:'done', manuscript:'progress')

---

## 8. 마이크로카피

- [ ] 모든 버튼 라벨과 설명이 “설교 작성”, “성경 연구”, “연결 보기” 등 일관된 용어 사용
- [ ] Breadcrumbs / 내비게이션 탭 / QuickNavButton / 페이지 헤더의 탭 명칭이 모두 일치
- [ ] 빈 상태 안내 문구가 자연스럽고 사용자를 다음 행동으로 안내함
- [ ] “연구”, “준비”, “작성” 단계 명칭이 페이지 내에서 일관됨 (영어+한글 혼용 없음)
- [ ] “노드(node)” 같은 영어 차용어 대신 순한글(“연결 보기”) 사용

---

## 9. 엣지 케이스

- [ ] 모든 탭에서 뒤로 가기 / 앞으로 가기 (브라우저 history) 정상 작동
- [ ] URL 직접 입력(`/advanced/projects/없는-id`) 시 404 또는 적절한 fallback
- [ ] manuscript 발표(presentation) 모드 진입/종료 정상
- [ ] manuscript 인쇄(print) 모드 진입/종료 정상
- [ ] ViewMode 전환(edit ↔ presentation ↔ print) 후에도 원고 데이터 유지
- [ ] auto-save simulation이 상태 변화(saving → saved)를 정상 표시
- [ ] 연구 단어 클릭 → 우측 패널 상세, 닫기 버튼 정상 작동
- [ ] 절 번호 클릭 → 우측 패널 주석, 닫기 정상
- [ ] 주제 버튼 클릭 → 우측 패널 주제 상세, 닫기 정상

---

## 10. SaveStatusIndicator

- [ ] 최신 버전(src/components/advanced/shared/SaveStatusIndicator.tsx, inline mapping 버전)이 사용됨
- [ ] types.ts import 의존성 없음 (runtime “Cannot read properties of undefined” 방지)
- [ ] 대시보드 / ProjectHeader / ManuscriptTab WritingContextHeader에서 모두 정상 표시
- [ ] 아이콘 + 색상 + 라벨(saving / saved / unsaved)이 각 상태에 맞게 표시됨

---

## 11. 최종 승인 기준

- [ ] build 0 errors
- [ ] 모든 페이지 HTTP 200
- [ ] 콘솔 에러 0건
- [ ] 3단계(study → prep → manuscript) 데이터 흐름이 자연스럽게 이어짐
- [ ] 시각적 일관성: 그림자 없음, 이모지 없음, 통일된 타이포그래피
- [ ] 마이크로카피 일관성: 영어 차용어 없음, 단계·탭 명칭 통일
- [ ] 상태 표시: 모든 저장/진행/버전 상태가 정확히 반영됨
- [ ] **→ 배포 승인**
