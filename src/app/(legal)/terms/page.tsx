/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '이용약관 | Bunker 목양',
  description: 'Bunker 목양 서비스 이용약관',
}

export default function TermsPage() {
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
            <h1 className="text-3xl font-bold text-white mb-2">이용약관</h1>
            <p className="text-[13px] text-slate-500">최종 수정일: {lastUpdated}</p>
          </header>

          <Section title="제1조 (목적)">
            본 약관은 Bunker 목양(이하 "회사")이 제공하는 AI 기반 설교 준비 보조 서비스
            (이하 "서비스")의 이용 조건 및 절차에 관한 사항과 회사와 이용자의 권리·의무 및 책임 사항을
            규정함을 목적으로 합니다.
          </Section>

          <Section title="제2조 (용어 정의)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>"서비스"란 회사가 제공하는 AI 기반 설교 원고 작성, 성경 연구, 노트 정리 등 일체의 서비스를 말합니다.</li>
              <li>"이용자"란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 회원을 말합니다.</li>
              <li>"AI 생성 콘텐츠"란 서비스 내에서 OpenAI 등 인공지능 모델이 생성한 일체의 텍스트, 분석, 제안 등을 말합니다.</li>
            </ol>
          </Section>

          <Section title="제3조 (약관의 효력 및 변경)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.</li>
              <li>회사는 「전자상거래법」, 「개인정보보호법」, 「정보통신망 이용촉진 및 정보보호에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
              <li>약관이 변경되는 경우 회사는 적용일자 및 변경 사유를 명시하여 현행 약관과 함께 서비스 초기화면에 그 적용일자 7일 전부터 공지합니다.</li>
              <li>이용자가 변경된 약관의 적용일 이후에도 서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 봅니다.</li>
            </ol>
          </Section>

          <Section title="제4조 (회원 가입 및 서비스 이용)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>이용자는 회사가 정한 양식에 따라 가입 정보를 기재한 후 본 약관에 동의한다는 의사표시를 함으로써 회원 가입이 완료됩니다.</li>
              <li>회사가 제공하는 모든 서비스는 회원 가입 후 <strong>무료로 이용</strong>할 수 있습니다. 별도의 결제나 등급 구분 없이 모든 회원이 동일한 기능을 제한 없이 사용하실 수 있습니다.</li>
              <li>회사는 다음 각 호에 해당하는 경우 회원 가입을 거절하거나 사후에 자격을 박탈할 수 있습니다.
                <ul className="list-disc list-inside ml-6 mt-1.5 space-y-1">
                  <li>타인의 명의를 도용하거나 허위 정보를 기재한 경우</li>
                  <li>만 14세 미만인 경우 (단, 법정대리인의 동의를 받은 경우 제외)</li>
                  <li>기존 회원이 아닌 경우 (중복 가입 금지)</li>
                  <li>사회 질서·미풍 양신에 위배되는 행위를 할 우려가 있는 경우</li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제5조 (서비스의 제공 및 변경)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>회사는 다음과 같은 서비스를 제공합니다.
                <ul className="list-disc list-inside ml-6 mt-1.5 space-y-1">
                  <li>AI 기반 설교 원고 생성 및 편집</li>
                  <li>성경 본문 원어(히브리어/헬라어) 분석</li>
                  <li>설교 노트 작성, 분류, 검색</li>
                  <li>설교 원고 버전 관리 및 회고</li>
                  <li>기타 회사가 추가로 개발하는 서비스</li>
                </ul>
              </li>
              <li>회사는 서비스의 내용을 변경하거나 중단할 수 있으며, 이 경우 사전에 공지합니다. 다만 천재·지변 등 불가항력적 사유가 있는 경우 사후에 공지할 수 있습니다.</li>
            </ol>
          </Section>

          <Section title="제6조 (AI 생성 콘텐츠의 성격과 책임)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>서비스가 생성하는 모든 AI 생성 콘텐츠는 <strong>참고용 보조 자료</strong>이며, 신학적·교리적·설교학적 정확성에 대한 <strong>최종 책임은 이용자(목회자) 본인</strong>에게 있습니다.</li>
              <li>AI 생성 콘텐츠에는 다음의 한계가 있을 수 있습니다.
                <ul className="list-disc list-inside ml-6 mt-1.5 space-y-1">
                  <li>원어 분석의 문법적·의미적 오류</li>
                  <li>특정 교단·신학적 전통의 해석과 다를 수 있음</li>
                  <li>최신 학술 연구나 신학적 견해가 반영되지 않을 수 있음</li>
                  <li>맥락에 부적절한 내용 생성 가능 (hallucination)</li>
                </ul>
              </li>
              <li>이용자는 AI 생성 콘텐츠를 강단에서 선포하거나 출판하기 전에 <strong>반드시 직접 검수</strong>해야 합니다.</li>
              <li>회사는 AI 생성 콘텐츠의 신학적·교리적·사실적 정확성, 특정 목적에의 적합성에 대해 어떠한 보증도 하지 않으며, AI 생성 콘텐츠의 사용으로 인해 발생하는 직·간접적 손해에 대해 책임을 지지 않습니다.</li>
            </ol>
          </Section>

          <Section title="제7조 (회원의 의무)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>이용자는 본 약관에서 정한 사항 및 회사가 정한 정책을 준수해야 합니다.</li>
              <li>이용자는 자신의 계정 정보를 안전하게 관리할 책임이 있으며, 제3자에게 양도·대여할 수 없습니다.</li>
              <li>이용자는 다음 행위를 하여서는 안 됩니다.
                <ul className="list-disc list-inside ml-6 mt-1.5 space-y-1">
                  <li>타인의 개인정보를 수집·저장·공개하는 행위</li>
                  <li>서비스를 통해 얻은 정보를 회사의 사전 동의 없이 영리 목적으로 이용·복제·배포하는 행위</li>
                  <li>서비스의 정상적인 운영을 방해하거나 시스템에 부하를 주는 행위</li>
                  <li>AI를 이용하여 타인에게 혐오·차별·폭력·음란물 등을 생성·유포하는 행위</li>
                  <li>기타 관련 법령을 위반하는 행위</li>
                </ul>
              </li>
            </ol>
          </Section>

          <Section title="제8조 (저작권 및 지식재산권)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>서비스 자체, 관련 소프트웨어, 디자인, 상표, 로고 등에 대한 지식재산권은 회사에 귀속됩니다.</li>
              <li>이용자가 서비스를 통해 <strong>작성·저장한 콘텐츠(설교 원고, 노트 등)의 저작권은 이용자 본인</strong>에게 귀속됩니다.</li>
              <li>AI 생성 콘텐츠는 인공지능 창작물에 해당하여 한국 저작권법상 보호를 받을 수 없으며, 이용자가 검수·수정·보완한 2차적 저작물에 한해 이용자에게 저작권이 귀속됩니다.</li>
            </ol>
          </Section>

          <Section title="제9조 (개인정보보호)">
            회사는 「개인정보보호법」에 따라 이용자의 개인정보를 보호하기 위해 노력하며, 개인정보의 수집·이용·제공·파기 등에 관한 구체적 사항은 별도의 「개인정보처리방침」에 따릅니다.
          </Section>

          <Section title="제10조 (계약 해지 및 이용 제한)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>이용자는 언제든지 서비스 내 설정 메뉴를 통해 회원 탈퇴를 요청할 수 있으며, 회사는 즉시 이를 처리합니다.</li>
              <li>이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을 방해하는 경우, 회사는 사전 통지 없이 이용을 제한하거나 계약을 해지할 수 있습니다.</li>
              <li>계약 해지 시 이용자의 데이터는 「개인정보처리방침」에 따라 처리됩니다.</li>
            </ol>
          </Section>

          <Section title="제11조 (면책)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>회사는 천재지변, 전쟁, 통신사업자의 서비스中断 등 불가항력적 사유로 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</li>
              <li>회사는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
              <li>AI 생성 콘텐츠의 신학적·교리적·사실적 오류로 인해 이용자 또는 제3자에게 발생하는 손해에 대해 회사는 책임을 지지 않습니다.</li>
            </ol>
          </Section>

          <Section title="제12조 (분쟁 해결 및 준거법)">
            <ol className="list-decimal list-inside space-y-1.5">
              <li>본 약관과 회사와 이용자 사이의 서비스 이용에 관한 분쟁은 「민사소송법」상 관할 법원을 제1심 관할 법원으로 하며, 대한민국 법령을 준거법으로 합니다.</li>
              <li>회사와 이용자 간 분쟁이 발생할 경우 양 당사자는 원만한 해결을 위해 성실히 협의하며, 협의가 이루어지지 않을 경우 「소비자 분쟁 해결 기준」에 따라 분쟁을 해결합니다.</li>
            </ol>
          </Section>

          <Section title="부칙">
            본 약관은 2026년 6월 22일부터 시행됩니다.
          </Section>

          <div className="pt-6 border-t border-white/10 text-[12px] text-slate-500 space-y-1">
            <p>Bunker 목양 | 사업자등록번호: (등록 후 입력)</p>
            <p>대표자: (등록 후 입력) | 이메일: contact@bunker.ai.kr</p>
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
      <div className="text-[13px] text-slate-300 leading-relaxed space-y-2 [&_ol]:space-y-2 [&_ul]:space-y-1 [&_strong]:text-amber-300 [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  )
}
