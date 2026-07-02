export type EventType = 'summer_bible' | 'retreat' | 'camp' | 'revival' | 'dawn_prayer' | 'teacher_seminar' | 'sports_day' | 'evangelism' | 'custom'

export type EventStatus = 'draft' | 'open' | 'closed' | 'ongoing' | 'completed'

export type RegistrationStatus = 'registered' | 'pending_payment' | 'confirmed' | 'cancelled' | 'waitlisted'

export type PaymentStatus = 'pending' | 'deposited' | 'partial' | 'refunded'

export type FormFieldType = 'text' | 'tel' | 'email' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  summer_bible: '여름성경학교',
  retreat: '수련회',
  camp: '캠프',
  revival: '부흥회',
  dawn_prayer: '특별새벽기도',
  teacher_seminar: '교사세미나',
  sports_day: '체육대회',
  evangelism: '전도행사',
  custom: '기타 행사',
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: '준비중',
  open: '접수중',
  closed: '접수마감',
  ongoing: '진행중',
  completed: '종료',
}

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  registered: '신청완료',
  pending_payment: '입금대기',
  confirmed: '참가확정',
  cancelled: '취소',
  waitlisted: '대기',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: '미입금',
  deposited: '입금확인',
  partial: '부분납부',
  refunded: '환불',
}

export interface FormFieldConfig {
  key: string
  label: string
  type: FormFieldType
  required: boolean
  options?: string[]
  enabled: boolean
}

export const DEFAULT_FORM_FIELDS: FormFieldConfig[] = [
  { key: 'participantName', label: '참가자 이름', type: 'text', required: true, enabled: true },
  { key: 'grade', label: '학년/반/부서', type: 'text', required: true, enabled: true },
  { key: 'gender', label: '성별', type: 'select', required: true, options: ['남', '여'], enabled: true },
  { key: 'birth', label: '생년월일', type: 'date', required: true, enabled: true },
  { key: 'parentName', label: '보호자 이름', type: 'text', required: true, enabled: true },
  { key: 'parentPhone', label: '보호자 연락처', type: 'tel', required: true, enabled: true },
  { key: 'address', label: '주소', type: 'text', required: false, enabled: true },
  { key: 'emergencyContact', label: '비상연락처', type: 'tel', required: true, enabled: true },
  { key: 'allergies', label: '알레르기/복용약', type: 'textarea', required: false, enabled: true },
  { key: 'tshirtSize', label: '티셔츠 사이즈', type: 'select', required: false, options: ['S', 'M', 'L', 'XL', '2XL'], enabled: true },
  { key: 'vehicleUsage', label: '차량 이용 여부', type: 'radio', required: true, options: ['이용함', '이용하지 않음'], enabled: true },
  { key: 'friendWith', label: '친구 동반 여부', type: 'text', required: false, enabled: true },
  { key: 'photoConsent', label: '사진촬영 동의', type: 'checkbox', required: true, enabled: true },
  { key: 'privacyConsent', label: '개인정보 수집 동의', type: 'checkbox', required: true, enabled: true },
]

export interface Event {
  id: string
  title: string
  eventType: EventType
  description: string
  location: string
  fee: number
  bankAccountInfo: string
  maxParticipants: number
  registrationStart: string
  registrationEnd: string
  eventStart: string
  eventEnd: string
  status: EventStatus
  formFields: FormFieldConfig[]
  createdAt: string
  createdBy: string
  targetDescription: string
}

export interface Registration {
  id: string
  eventId: string
  userId: string | null
  participantName: string
  grade: string
  gender: string
  birth: string
  parentName: string
  parentPhone: string
  address: string
  emergencyContact: string
  allergies: string
  tshirtSize: string
  vehicleUsage: string
  friendWith: string
  photoConsent: boolean
  privacyConsent: boolean
  extraFields: Record<string, string>
  status: RegistrationStatus
  paymentStatus: PaymentStatus
  depositorName: string
  paymentAmount: number
  paymentDate: string
  adminMemo: string
  groupId: string | null
  teamId: string | null
  vehicleId: string | null
  checkInAt: string | null
  returnCheckAt: string | null
  notes: string
  createdAt: string
  updatedAt: string
}

export interface EventGroup {
  id: string
  eventId: string
  name: string
  description: string
  maxCapacity: number
  color: string
  order: number
}

export interface EventTeam {
  id: string
  groupId: string
  name: string
  maxCapacity: number
  order: number
}

export interface EventVehicle {
  id: string
  eventId: string
  name: string
  driverName: string
  driverPhone: string
  maxCapacity: number
  departureTime: string
  departureLocation: string
  routeDescription: string
  order: number
  stops: VehicleStop[]
}

export interface VehicleStop {
  id: string
  name: string
  order: number
}

export interface EventNotice {
  id: string
  eventId: string
  title: string
  content: string
  target: 'all' | 'group' | 'team' | 'payment_pending' | 'not_checked_in'
  targetId: string | null
  sentAt: string
  sentBy: string
}

export interface EventStats {
  totalRegistrations: number
  confirmedCount: number
  pendingPaymentCount: number
  checkInCount: number
  cancelledCount: number
  groupStats: { groupId: string; groupName: string; count: number }[]
}
