export type State = "all" | "paid" | "overdue" | 'unpaid';

export interface GetPaymentsOptions {
  page?: number;
  perPage?: number;
  state?: State;
}

export type PaymentStatus = Omit<State, 'all'>;

export interface PaymentMaker {
  id: number;
  email: string;
  email_verified_at: string;
  created_at: string;
  status: UserStatus;
  name: string;
  last_login_at: string;
  updated_at: string;
}

export interface MakePaymentResponse {
  message: string;
  data: Omit<Payment, 'user'>;
}

export type PaymentStatusItem = {
  value: PaymentStatus;
  label: string;
};
export type UserStatusItem = {
  value: UserStatus | 'all';
  label: string;
};
export interface Payment {
  user: PaymentMaker;
  amount: number;
  id: number;
  user_id: number;
  currency: string;
  payment_expected_at: string;
  payment_made_at: string | null;
  created_at: string;
  updated_at: string;

  // client-side modification properties
  _selected?: boolean;
}

export interface PaymentPaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export type UserStatus = 'active' | 'inactive';

export type GetPaymentsResult = {
  data: Payment[];
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string;
  links: PaymentPaginationLink[]
  path: string;
  per_page: number;
  prev_page_url: string;
  to: number;
  total: number;
}
