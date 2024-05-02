import type { StatusItem } from "../types";



export const PAYMENT_STATUSES: Array<StatusItem> = [
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


export const USER_STATUSES: Array<StatusItem> = [
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


export const TABLE_FILTERS_EMITS = {
  PAYMENT_STATUS_EMIT: 'on_payment_status_change',
  AMOUNT_INPUT_EMIT: 'on_amount_input',
  SEARCH_INPUT_EMIT: 'on_name_input',
  USER_STATUS_EMIT: 'on_user_status_change'
} as const;


export const PAGINATION_EMITS = {
  ON_CURRENT_PAGE_CHANGE: 'current_page_change',
  ON_PER_PAGE_CHANGE: 'per_page_change'
} as const;