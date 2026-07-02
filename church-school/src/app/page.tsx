import Link from 'next/link';
import { ArrowRight, MessageSquare, BookOpen, ClipboardList, CalendarHeart, Sparkles, Download, Users, FileText, Check, AlertCircle, Shield, Star, Zap } from 'lucide-react';

const HERO_STATS = [
  { label: '교회학교 자료 템플릿', value: '30+', icon: FileText },
  { label: '실무 해결 영역', value: '4개', icon: ClipboardList },
  { label: '즉시 다운로드 무료자료', value: '14개', icon: Download },
];

const PAIN_POINTS = [
  { title: '학부모 소통', desc: '학부모 안내 공지를 매번 쓸 때마다 첫 문장부터 고민하고 새로 적고 계신가요?' },
  { title: '교사 교육', desc: '교사 세미나나 교육 자료가 급하게 필요한데, 참고할 만한 전문 양식이 없나요?' },
  { title: '운영 문서', desc: '연간 계획서, 출석 통계, 보고서 등 매번 쓰던 문서 양식을 못 찾아 헤매시나요?' },
  { title: '시즌 행사', desc: '절기마다 다가오는 특별 행사를 앞두고 준비 체크리스트가 누락되기 쉽나요?' },
];

const PILLARS = [
  { title: '학부모 소통 자료', desc: '예배 안내, 행사 동의서, 비상 공지 등 학부모님과의 원활한 소통을 위한 최적의 안내 템플릿입니다.', icon: MessageSquare, color: 'text-mint-600', bgColor: 'bg-mint-50' },
  { title: '교사 교육 자료', desc: '신입 교사 가이드북, 영성 교육 교재, 주간 교사 회의록 등 교사 성장에 꼭 필요한 교재입니다.', icon: BookOpen, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { title: '운영문서 템플릿', desc: '연간 예산/결산 양식, 부서 일지, 출석부 통계표 등 정형화된 교육 실무 행정 양식입니다.', icon: ClipboardList, color: 'text-navy-600', bgColor: 'bg-navy-50' },
];

const CATEGORIES = [
  { title: '학부모 소통', icon: MessageSquare, desc: '개학/방학 안내문, 여름캠프 신청서, 간담회 초대장 등 12개 템플릿', path: '/resources?category=parent_comm', color: 'text-mint-600', bgColor: 'bg-mint-50' },
  { title: '교사 교육', icon: BookOpen, desc: '오리엔테이션 가이드, 분반 매뉴얼, 찬양 리더십 지침 등 6개 양식', path: '/resources?category=teacher_edu', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { title: '운영 문서', icon: ClipboardList, desc: '예배 순서지, 출석부 통계, 예결산 보고서 등 6개 정수 문서', path: '/resources?category=operation', color: 'text-navy-600', bgColor: 'bg-navy-50' },
  { title: '시즌 행사', icon: CalendarHeart, desc: '여름 성경학교, 절기 발표회, 크리스마스 등 시즈널 특별 체크리스트', path: '/resources?category=season_event', color: 'text-purple-600', bgColor: 'bg-purple-50' },
];

const FREE_ITEMS = [
  { title: '학부모 공지문 샘플 10종', desc: '가장 많이 쓰는 절기 안내, 개학, 수련회 등 공지문 모음집', size: 'PDF / HWP', count: '1,205회 다운로드' },
  { title: '신입교사 체크리스트 & 가이드', desc: '신임 교사가 부서에 처음 왔을 때 챙겨야 할 10가지 실무 지침', size: 'PDF / DOCX', count: '980회 다운로드' },
  { title: '운영문서 필수 샘플 3종', desc: '예배 순서지 템플릿, 연간계획 양식, 기본 지출 결의서', size: 'XLSX / PPTX', count: '670회 다운로드' },
];

export default function HomePage() {
  return (
    <div className="bg-warm-50 min-h-screen">
      {/* 1. 히어로 섹션 */}
      <section className="relative overflow-hidden gradient-navy text-white py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-mint-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs md:text-sm text-mint-300 mb-6 font-semibold animate-fade-in">
            <Sparkles className="w-4 h-4" />
            사역은 본질에 집중하고, 준비는 더 가볍게
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            교회학교 사역의 준비는 줄이고,<br />
            <span className="text-gradient bg-gradient-to-r from-mint-300 to-mint-400 bg-clip-text text-transparent">
              부서 운영은 더 체계적으로
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-navy-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            학부모 소통 공지부터 교사교육, 각종 행정 운영문서까지.<br />
            매번 새로 만드느라 낭비되던 시간을 검증된 템플릿과 AI 작성기로 덜어드립니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link href="/free" className="btn-secondary btn-lg w-full sm:w-auto group">
              무료자료 받기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/notice-writer" className="btn-outline btn-lg w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
              <Sparkles className="w-5 h-5" />
              공지문 작성해보기
            </Link>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto border-t border-white/10 pt-8">
            {HERO_STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl sm:text-3xl font-extrabold text-mint-400">{stat.value}</div>
                <div className="text-xs text-navy-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave background separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 35C840 40 960 50 1080 52.5C1200 55 1320 50 1380 47.5L1440 45V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="#FAFAF8" />
          </svg>
        </div>
      </section>

      {/* 2. 문제 제시 섹션 */}
      <section className="section bg-warm-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">주요 애로사항</span>
            <h2 className="section-title mt-2">주일학교 사역 현장의 지치는 순간들</h2>
            <p className="section-subtitle mx-auto">매주 찾아오는 실무 행정, 혼자서 전부 짊어지고 계신가요?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PAIN_POINTS.map((item, i) => (
              <div key={i} className="card-flat p-6 bg-white border border-warm-200 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900 mb-1">{item.title}의 한계</h3>
                  <p className="text-sm text-navy-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 해결 구조 섹션 */}
      <section className="section bg-white border-y border-warm-100">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-mint-600 uppercase tracking-wider">해결 가이드</span>
            <h2 className="section-title mt-2">사역의 짐을 덜어주는 3가지 기둥 + 1가지 도구</h2>
            <p className="section-subtitle mx-auto">체계적인 자료 설계와 인공지능이 사역 시간을 획기적으로 확보해 줍니다.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-stretch max-w-5xl mx-auto">
            {/* 3대 기둥 자료 */}
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="card p-6 bg-white border border-warm-200/50 flex flex-col justify-between">
                  <div>
                    <div className={`w-12 h-12 rounded-2xl ${pillar.bgColor} ${pillar.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-navy-900 mb-2">{pillar.title}</h3>
                    <p className="text-xs text-navy-500 leading-relaxed mb-6">{pillar.desc}</p>
                  </div>
                  <span className="text-xs font-bold text-navy-400">실무 문서 템플릿</span>
                </div>
              );
            })}

            {/* AI 작성기 도구 */}
            <div className="card p-6 bg-gradient-to-br from-navy-900 to-navy-800 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-mint-500/10 rounded-full blur-2xl" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-mint-300 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">AI 공지문 작성기</h3>
                <p className="text-xs text-navy-200 leading-relaxed mb-6">
                  간단한 단어와 상황 입력만으로 사역자가 원하는 톤앤매너에 맞게 카카오톡용 공지문을 즉시 써주는 도구입니다.
                </p>
              </div>
              <Link href="/notice-writer" className="text-xs font-bold text-mint-300 hover:text-mint-200 flex items-center gap-1.5">
                체험하기 <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 대표 자료 섹션 */}
      <section className="section bg-warm-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">주요 카테고리</span>
            <h2 className="section-title mt-2">필요한 모든 실무 영역을 포괄합니다</h2>
            <p className="section-subtitle mx-auto">사역 현장에서 반복해 마주하는 4가지 카테고리의 템플릿입니다.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <Link key={i} href={cat.path} className="card p-6 bg-white border border-warm-200 flex flex-col justify-between group">
                  <div>
                    <div className={`w-12 h-12 rounded-xl ${cat.bgColor} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-navy-900 mb-2 group-hover:text-mint-600 transition-colors">{cat.title}</h3>
                    <p className="text-xs text-navy-400 leading-relaxed mb-4">{cat.desc}</p>
                  </div>
                  <span className="text-xs font-bold text-mint-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    자료 리스트 보기 <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. 공지문 작성기 소개 섹션 */}
      <section className="section bg-white border-y border-warm-100">
        <div className="container-custom max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-mint-600 uppercase tracking-wider">강력한 사역 도구</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-navy-900 leading-tight">
                단 몇 초 만에<br />공지문 완성하기
              </h2>
              <p className="text-xs md:text-sm text-navy-500 leading-relaxed">
                바쁜 사역 준비 중 매번 공지 메시지 단어 선택으로 머리 아플 필요가 없습니다. 상황, 대상, 말투만 체크하면 맞춤형 시안 3종을 생성해 줍니다.
              </p>
              <div className="pt-2">
                <Link href="/notice-writer" className="btn-secondary btn-sm group">
                  작성기 사용해보기
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 bg-warm-50 rounded-2xl p-6 border border-warm-200 space-y-4">
              <div className="text-xs font-bold text-navy-600 border-b border-warm-200 pb-2">작성기 동작 예시</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-lg p-2.5 text-center text-[10px] font-bold text-navy-800 border border-warm-200">
                  <span className="text-navy-400 block font-normal">상황</span>
                  행사 안내
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center text-[10px] font-bold text-navy-800 border border-warm-200">
                  <span className="text-navy-400 block font-normal">대상</span>
                  학부모 대상
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center text-[10px] font-bold text-navy-800 border border-warm-200">
                  <span className="text-navy-400 block font-normal">톤</span>
                  따뜻한 어조
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-warm-200 text-[11px] text-navy-800 leading-relaxed font-sans shadow-sm whitespace-pre-line">
                {`사랑하는 학부모님께,\n\n주일 아침이 더욱 풍성해지는 교회학교 절기 예배가 이번 주에 준비되어 있습니다. 귀한 자녀들의 걸음이 은혜의 자리로 향할 수 있도록 기도와 격려로 동행해 주시기 바랍니다.\n\n📅 일시: 이번 주 주일 오전 11시\n📍 장소: 본당 2층 교육관\n\n예배 후 다과 교제도 있으니 늦지 않게 모이도록 챙겨주세요!`}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. 무료자료 섹션 */}
      <section className="section bg-warm-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-mint-600 uppercase tracking-wider">무료 리소스 패키지</span>
            <h2 className="section-title mt-2">지금 즉시 무료로 사용 가능한 인기 자료</h2>
            <p className="section-subtitle mx-auto">간단한 로그인만으로 워크스페이스에 즉시 저장하고 사용할 수 있습니다.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            {FREE_ITEMS.map((item, i) => (
              <div key={i} className="card-flat p-6 bg-white border border-warm-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge-free">FREE</span>
                    <span className="text-[10px] text-navy-400 font-bold">{item.size}</span>
                  </div>
                  <h3 className="text-base font-bold text-navy-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-navy-500 leading-relaxed mb-4">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-warm-100">
                  <span className="text-[10px] text-navy-400 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    {item.count}
                  </span>
                  <Link href="/free" className="text-xs font-bold text-mint-600 hover:underline">
                    받기
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/free" className="btn-outline btn-sm">
              무료 자료 전체 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* 7. 요금제 미리보기 섹션 */}
      <section className="section bg-white border-t border-warm-100">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">비즈니스 가격 정책</span>
            <h2 className="section-title mt-2">사역의 규모와 주기에 맞게 선택하세요</h2>
            <p className="section-subtitle mx-auto">필요에 따라 개별 구매하거나 무제한 구독으로 효율을 극대화하세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <div className="card-flat p-6 text-center bg-warm-50">
              <div className="w-10 h-10 rounded-full bg-warm-200 text-navy-600 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">무료 플랜</h3>
              <p className="text-xl font-extrabold text-navy-950 mt-1">₩0</p>
              <p className="text-[10px] text-navy-400 mt-0.5">영구 무료 제공</p>
              <ul className="text-[11px] text-navy-600 space-y-2 my-5 text-left pl-2">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-mint-500" /> 무료 자료 자유 다운로드</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-mint-500" /> 하루 3회 공지문 작성</li>
              </ul>
              <Link href="/login" className="btn-outline btn-sm w-full">무료로 가입</Link>
            </div>

            {/* Single */}
            <div className="card-flat p-6 text-center bg-white border-2 border-mint-400 relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-mint-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                실용적 선택
              </span>
              <div className="w-10 h-10 rounded-full bg-mint-50 text-mint-600 flex items-center justify-center mx-auto mb-3">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">단건 상품</h3>
              <p className="text-xl font-extrabold text-navy-950 mt-1">자료별 가격</p>
              <p className="text-[10px] text-navy-400 mt-0.5">평생 영구 소장</p>
              <ul className="text-[11px] text-navy-600 space-y-2 my-5 text-left pl-2">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-mint-500" /> 유료 개별 자료 영구 보관</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-mint-500" /> 하루 10회 공지문 작성</li>
              </ul>
              <Link href="/resources" className="btn-secondary btn-sm w-full">자료 보기</Link>
            </div>

            {/* Monthly */}
            <div className="card-flat p-6 text-center bg-warm-50">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">월 구독</h3>
              <p className="text-xl font-extrabold text-navy-950 mt-1">₩9,900/월</p>
              <p className="text-[10px] text-navy-400 mt-0.5">무제한 이용권</p>
              <ul className="text-[11px] text-navy-600 space-y-2 my-5 text-left pl-2">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-mint-500" /> 유료 자료실 전수 다운로드</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-mint-500" /> AI 공지문 무제한 이용</li>
              </ul>
              <Link href="/pricing" className="btn-outline btn-sm w-full">혜택 비교</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. 마지막 CTA 섹션 */}
      <section className="py-20 bg-gradient-to-br from-navy-950 to-navy-900 text-white text-center">
        <div className="container-custom max-w-xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            지금 교회학교의 실무 경쟁력을 높이세요
          </h2>
          <p className="text-xs md:text-sm text-navy-300 leading-relaxed max-w-md mx-auto">
            무료 자료를 다운로드하여 직접 사용해보시고, AI 공지문 작성기로 매주 작성하는 주보 공지 시간을 혁신적으로 줄여 보세요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/free" className="btn-secondary w-full sm:w-auto">
              지금 무료자료로 시작하기
            </Link>
            <Link href="/notice-writer" className="btn-outline border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
              공지문 작성기 체험하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
