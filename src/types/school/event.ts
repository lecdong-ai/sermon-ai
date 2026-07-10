export type EventStatus = 'draft' | 'open' | 'closed' | 'cancelled';
export type ApplicationStatus = 'submitted' | 'confirmed' | 'waiting_deposit' | 'deposited' | 'cancelled';
export type PaymentStatus = 'pending' | 'waiting_deposit' | 'deposited' | 'cancelled';
export type CheckInStatus = 'not_checked_in' | 'checked_in';
export type Gender = 'male' | 'female';

export interface CustomField {
  id: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

export interface EventRecord {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  deadline: string | null;
  capacity: number | null;
  status: EventStatus;
  link_token: string;
  custom_fields: CustomField[];
  is_template: boolean;
  cloned_from: string | null;
  contact_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationRecord {
  id: string;
  event_id: string;
  student_name: string;
  grade: string;
  department: string | null;
  birth_date: string;
  gender: Gender;
  parent_name: string;
  parent_phone: string;
  emergency_phone: string | null;
  health_notes: string | null;
  allergies: string | null;
  privacy_consent: boolean;
  privacy_consented_at: string | null;
  privacy_consent_text: string | null;
  photo_consent: boolean;
  photo_consent_text: string | null;
  payment_status: PaymentStatus;
  status: ApplicationStatus;
  custom_responses: Record<string, string>;
  check_in_at: string | null;
  check_in_status: CheckInStatus;
  created_at: string;
  updated_at: string;
}

export interface ApplicationInput {
  student_name: string;
  grade: string;
  department?: string;
  birth_date: string;
  gender: Gender;
  parent_name: string;
  parent_phone: string;
  emergency_phone?: string;
  health_notes?: string;
  allergies?: string;
  privacy_consent: boolean;
  photo_consent: boolean;
  custom_responses?: Record<string, string>;
}

export interface EventInput {
  title: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  deadline?: string;
  capacity?: number | null;
  status?: EventStatus;
  custom_fields?: CustomField[];
  is_template?: boolean;
  contact_info?: string;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: '신청완료',
  confirmed: '확정',
  waiting_deposit: '입금대기',
  deposited: '입금완료',
  cancelled: '취소',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmed: 'bg-mint-50 text-mint-700 border-mint-200',
  waiting_deposit: 'bg-orange-50 text-orange-700 border-orange-200',
  deposited: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: '임시저장',
  open: '신청중',
  closed: '신청마감',
  cancelled: '취소됨',
};

export const PRIVACY_CONSENT_TEXT = '본인은 위에 기재한 개인정보가 행사 운영 목적(참가자 관리, 비상연락, 건강관리)으로 수집·이용되는 것에 동의합니다. 수집된 정보는 행사 종료 후 1년 이내에 파기됩니다.';
export const PHOTO_CONSENT_TEXT = '본인은 행사 기간 중 촬영된 본인 자녀의 사진·영상이 교회 내부 자료(주보, 교회 홈페이지, SNS 등)에 활용되는 것에 동의합니다. (선택 사항이며, 미동의 시 촬영에 제약이 있을 수 있습니다.)';
