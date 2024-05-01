import type { PaymentStatusItem, UserStatusItem } from "../types";



export const PAYMENT_STATUSES: Array<PaymentStatusItem> = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'paid',
    label: 'Paid',
  },
  {
    value: 'unpaid',
    label: 'Unpaid',
  },

  {
    value: 'overdue',
    label: 'Overdue',
  }
];


export const AMOUNT_FILTERS = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'greater_than_1000',
    label: '>$100',
  },
  {
    value: 'less_than_1000',
    label: '$>1000',
  }
]


export const USER_STATUSES: Array<UserStatusItem> = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'active',
    label: 'Active',
  },
  {
    value: 'inactive',
    label: 'Inactive',
  }
]