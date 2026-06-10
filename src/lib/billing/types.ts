export type PlanId = 'basic' | 'pro'
export type BillingCycle = 'monthly'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'canceled'

export interface PlanFeature {
  text: string
  ok: boolean
  highlight?: boolean
}

export interface Plan {
  id: PlanId
  name: string
  price: number
  billingCycle: BillingCycle
  features: PlanFeature[]
  isRecommended: boolean
  priceLabel: string
  description: string
}

export interface Subscription {
  id: string
  userId: string
  planId: PlanId
  status: SubscriptionStatus
  startDate: string
  nextBillingDate: string
  canceledAt: string | null
  paymentMethod: string | null
  provider: string
  providerCustomerKey: string | null
  providerBillingKey: string | null
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  userId: string
  subscriptionId: string
  orderId: string
  amount: number
  status: PaymentStatus
  paidAt: string | null
  method: string | null
  provider: string
  providerPaymentKey: string | null
  createdAt: string
}

export interface PlanChangeRequest {
  fromPlanId: PlanId
  toPlanId: PlanId
  effectiveDate: string
  immediateChange: boolean
}

export const PLAN_DATA: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9900,
    billingCycle: 'monthly',
    isRecommended: false,
    priceLabel: '월 9,900원',
    description: '설교 준비를 시작하는 목회자에게 적합한 플랜입니다.',
    features: [
      { text: 'AI 분석 및 컨텐츠 제작 월 10회', ok: true },
      { text: '설교원고제작 월 10회', ok: true },
      { text: '요약 / 나눔 자료 / 카드뉴스', ok: true },
      { text: '설교 대본 / 쇼츠 대본 / PPT', ok: true },
      { text: '결과 공유 및 다운로드', ok: true },
      { text: '매월 자동 초기화', ok: true },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19800,
    billingCycle: 'monthly',
    isRecommended: true,
    priceLabel: '월 19,800원',
    description: '설교 준비를 더 넉넉하게 이용하고 싶은 목회자에게 추천합니다.',
    features: [
      { text: 'AI 분석 및 컨텐츠 제작 월 20회', ok: true, highlight: true },
      { text: '고급형 설교원고제작 월 20회', ok: true, highlight: true },
      { text: '요약 / 나눔 자료 / 카드뉴스', ok: true },
      { text: '설교 대본 / 쇼츠 대본 / PPT', ok: true },
      { text: '결과 공유 및 다운로드', ok: true },
      { text: '매월 자동 초기화', ok: true },
    ],
  },
]

export interface FreePlan {
  id: 'free'
  name: string
  price: number
  features: { text: string; ok: boolean }[]
  priceLabel: string
  description: string
}

export const FREE_PLAN: FreePlan = {
  id: 'free',
  name: '무료체험',
  price: 0,
  priceLabel: '무료',
  description: '회원가입 후 바로 무료로 체험해보세요.',
  features: [
    { text: 'AI 분석 및 컨텐츠 제작 3회', ok: true },
    { text: '설교원고제작 1회', ok: true },
    { text: '요약 / 나눔 자료 / 카드뉴스', ok: true },
    { text: '설교 대본 / 쇼츠 대본 / PPT', ok: true },
    { text: '결과 공유 및 다운로드', ok: true },
    { text: '유효 기간 15일', ok: true },
  ],
}

export const SUBSCRIPTION_STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: '이용 중',
  trialing: '체험 중',
  past_due: '결제 지연',
  canceled: '해지됨',
  expired: '만료됨',
}

export const SUBSCRIPTION_STATUS_COLOR: Record<SubscriptionStatus, string> = {
  active: 'bg-emerald-50 text-emerald-600',
  trialing: 'bg-blue-50 text-blue-600',
  past_due: 'bg-amber-50 text-amber-600',
  canceled: 'bg-slate-100 text-slate-500',
  expired: 'bg-red-50 text-red-500',
}
