/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '개인정보처리방침 | Bunker 목양',
  description: 'Bunker 목양 개인정보처리방침',
}

export default function PrivacyPage() {
  const lastUpdated = '2026-06-22'

  return (
    <div className="min-h-screen bg-[#04060f] text-slate-200">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          돌아가기
        </Link>

        <div className="bg-[#0a0e1a] border border-white/10 rounded-2xl p-8 space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-white mb-2">개인정보처리방침</h1>
            <p className="text-[13px] text-slate-500">최종 수정일: {lastUpdated}</p>
            <p className="text-[13px] text-slate-400 mt-3">
              Bunker 목양은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고
              권익을 보장하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>
          </header>

          <Section title="제1조 (개인정보의 처리 목적)">
            <p>Bunker 목양은 다음의 목적을 위하여 개인정보를 처리합니다. 처리된 개인정보는 다음의 목적 외의 용도로 사용되지 않으며, 이용 목적이 변경되는 경우 개인정보 보호법에 따라 별도의 동의를 받는 등 필요한 조치를 이행합니다.</p>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>회원 가입 및 관리: 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지</li>
              <li>서비스 제공: AI 기반 설교 원고 생성, 성경 연구, 노트 작성 등 콘텐츠 생성·저장·열람 서비스 제공</li>
              <li>유료 서비스(후원): 결제·환불 처리, 사역 동참자 자격 부여 및 관리</li>
              <li>고객 지원: 문의 응답, 공지사항 전달, 이용 관련 분쟁 해결</li>
              <li>서비스 개선: 신규 서비스 개발, 서비스 이용 통계·분석</li>
            </ol>
          </Section>

          <Section title="제2조 (처리하는 개인정보 항목)">
            <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
            <h3 className="text-[14px] font-semibold text-slate-100 mt-3 mb-1.5">필수 항목</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>이메일 (로그인 ID)</li>
              <li>비밀번호 (암호화 저장)</li>
              <li>서비스 이용 기록 (작성한 노트, 설교 원고 등 콘텐츠)</li>
              <li>결제 정보 (PG사 측에 저장, 회사는 직접 보관하지 않음)</li>
            </ol>
            <h3 className="text-[14px] font-semibold text-slate-100 mt-3 mb-1.5">선택 항목</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>이름 (프로필에 표시)</li>
              <li>프로필 사진</li>
            </ol>
            <h3 className="text-[14px] font-semibold text-slate-100 mt-3 mb-1.5">자동 수집 항목</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>IP 주소, 쿠키, 서비스 이용 기록, 기기 정보, 접속 로그</li>
            </ol>
          </Section>

          <Section title="제3조 (개인정보의 처리 및 보유 기간)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</li>
              <li>각 항목별 보유 기간은 다음과 같습니다.
                <ul className="list-disc list-inside ml-6 mt-1.5 space-y-1">
                  <li>회원 정보: 회원 탈퇴 시 즉시 삭제 (단, 관계 법령 위반 조사 등을 위해 필요할 경우 해당 조사 종료 시까지)</li>
                  <li>작성 콘텐츠 (노트, 설교 원고 등): 회원 탈퇴 시 즉시 삭제</li>
                  <li>결제·환불 기록: 5년 (「전자상거래법」)</li>
                  <li>서비스 이용 로그: 3개월 (「통신비밀보호법」)</li>
                </ul>
              </li>
              <li>이용자가 별도 동의 없이 제공한 정보는 동의 철회 시까지 보관하며, 동의 철회 시 지체 없이 파기합니다.</li>
            </ol>
          </Section>

          <Section title="제4조 (개인정보의 제3자 제공)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.</li>
              <li>다만, 다음의 경우에는 예외로 합니다.
                <ul className="list-disc list-inside ml-6 mt-1.5 space-y-1">
                  <li>이용자가 사전에 동의한 경우</li>
                  <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                </ul>
              </li>
              <li>서비스 제공을 위해 다음의 외부 업체에 개인정보 처리가 위탁될 수 있습니다 (사전 고지 후 반영).
                <ul className="list-disc list-inside ml-6 mt-1.5 space-y-1">
                  <li>OpenAI (미국): AI 모델 호출을 위한 프롬프트/입력 텍스트 전달 (서비스 제공 목적)</li>
                  <li>Toss Payments (한국): 결제 처리 (유료 서비스 제공 목적)</li>
                  <li>Supabase (미국/지역 설정): 데이터베이스 호스팅 및 인증 처리</li>
                  <li>Vercel (미국): 웹 호스팅</li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제5조 (개인정보의 국외 이전)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>회사는 서비스 제공을 위해 이용자의 일부 정보를 국외에 있는 외부 서비스 제공업체에 전송·저장할 수 있습니다.
                <ul className="list-disc list-inside ml-6 mt-1.5 space-y-1">
                  <li>OpenAI, L.L.C. (미국, 샌프란시스코): AI 모델 호출용 입력 텍스트. 전송 항목: 사용자가 입력한 텍스트 (이메일 등 식별 정보는 포함되지 않음). 보유·이용 기간: OpenAI의 데이터 보유 정책에 따름 (기본적으로 API 호출 데이터는 모델 학습에 사용되지 않음).</li>
                  <li>Supabase, Inc. (미국 또는 EU 리전): 데이터베이스. 전송 항목: 회원 정보 및 작성 콘텐츠. 보유·이용 기간: 회원 탈퇴 시까지.</li>
                </ul>
              </li>
              <li>이용자는 개인정보의 국외 이전에 동의하지 않을 권리가 있으나, 거부 시 서비스 이용이 제한됩니다.</li>
            </ol>
          </Section>

          <Section title="제6조 (정보주체의 권리·의무 및 행사 방법)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>이용자는 회사에 대해 언제든지 다음의 권리를 행사할 수 있습니다.
                <ul className="list-disc list-inside ml-6 mt-1.5 space-y-1">
                  <li>개인정보 열람 요구</li>
                  <li>오류 등이 있을 경우 정정·삭제 요구</li>
                  <li>처리 정지 요구</li>
                  <li>개인정보의 처리·이용에 대한 동의 철회 (회원 탈퇴)</li>
                </ul>
              </li>
              <li>권리 행사는 회사에 대해 서면, 전자우편 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.</li>
              <li>만 14세 미만 아동의 경우, 법정대리인이 권리를 행사할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제7조 (개인정보의 파기)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</li>
              <li>이용자로부터 동의 받은 개인정보 보유 기간이 경과하거나 처리 목적이 달성되었음에도 다른 법령에 따라 보존할 필요가 있는 경우, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관 장소를 달리하여 보존합니다.</li>
              <li>파기 절차 및 방법
                <ul className="list-disc list-inside ml-6 mt-1.5 space-y-1">
                  <li>전자적 파일: 복구 및 재생이 불가능한 방법으로 영구 삭제</li>
                  <li>종이 문서: 파쇄 또는 소각</li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제8조 (개인정보의 안전성 확보 조치)">
            <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육</li>
              <li>기술적 조치: 비밀번호 암호화 저장, HTTPS 통신, 데이터베이스 접근통제 (Supabase RLS), 입력값 검증</li>
              <li>물리적 조치: 데이터센터 출입통제 (Supabase/Vercel 측 관리)</li>
            </ol>
          </Section>

          <Section title="제9조 (쿠키의 사용)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>회사는 이용자에게 맞춤화된 서비스를 제공하기 위해 쿠키를 사용합니다.</li>
              <li>쿠키는 웹사이트 운영에 이용되며, 이용자의 로컬 브라우저에 저장됩니다.</li>
              <li>이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용이 제한될 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제10조 (개인정보 보호책임자)">
            <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            <div className="bg-white/5 rounded-lg p-4 text-[13px] mt-2">
              <p><strong>개인정보 보호책임자</strong></p>
              <p>성명: (등록 후 입력)</p>
              <p>이메일: privacy@bunker.ai.kr</p>
            </div>
          </Section>

          <Section title="제11조 (권익침해 구제방법)">
            <p>정보주체는 개인정보 침해로 인한 구제를 받기 위하여 아래의 기관에 분쟁 해결을 신청할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>개인정보 분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
              <li>개인정보침해신고센터: 1833-4119 (www.privacy.go.kr)</li>
              <li>대검찰청 사이버수사과: 1301 (www.spo.go.kr)</li>
              <li>경찰청 사이버안전국: 182 (cyberbureau.police.go.kr)</li>
            </ul>
          </Section>

          <Section title="제12조 (개인정보처리방침의 변경)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>본 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 시행일 7일 전부터 공지사항을 통해 고지합니다.</li>
              <li>변경된 내용은 서비스 초기화면 또는 회원가입 시 고지되며, 이용자가 변경된 정책에 동의하지 않을 경우 회원 탈퇴를 진행할 수 있습니다.</li>
            </ol>
          </Section>

          <div className="pt-6 border-t border-white/10 text-[12px] text-slate-500 space-y-1">
            <p>Bunker 목양 | 사업자등록번호: (등록 후 입력)</p>
            <p>개인정보 보호책임자: (등록 후 입력) | 이메일: privacy@bunker.ai.kr</p>
            <p>주소: (등록 후 입력)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[16px] font-bold text-slate-100 mb-3">{title}</h2>
      <div className="text-[13px] text-slate-300 leading-relaxed space-y-2 [&_ol]:space-y-2 [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  )
}
