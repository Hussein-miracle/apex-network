<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue'
import paymentsService from '@/services/payments.service'
import type { Payment, PaymentStatus as PSType, State, StatusItem } from '@/shared/types'
import { formatPaymentTableData, generateArray, errorToast } from '@/shared/utils'

import { PAYMENT_STATUSES, USER_STATUSES } from '@/shared/constants'
import PaymentTable from '@/components/PaymentTable.vue'
import TableFilter from '@/components/TableFilter.vue'
import Pagination from '@/components/Pagination.vue'
import { usePaymentsStore } from '@/stores/payments'

const { setSelectedPayments } = usePaymentsStore()
const isLoadingTable = ref<boolean>(false)
const tableData = ref<Payment[]>([])
const tableDataCopy = shallowRef<Payment[]>([])
const selectedPaymentStatus = ref<StatusItem['value']>(PAYMENT_STATUSES[0].value)
const selectedUserStatus = ref<StatusItem['value']>(USER_STATUSES[0].value)
// const selectedAmountFilter = ref(AMOUNT_FILTERS[0])
const amountInput = ref<string>('')
const searchInput = ref<string>('')

// PAGINATIONS
const currentPage = ref<number>(1)
const perPage = ref<number>(6)
const maxPagesShown = ref<number>(10)
const hasNextPage = ref<null | boolean>(null)
const hasPrevPage = ref<null | boolean>(null)
const totalItems = ref(0)

const resetFilters = async () => {
  selectedPaymentStatus.value = PAYMENT_STATUSES[0].value
  selectedUserStatus.value = USER_STATUSES[0].value
  amountInput.value = ''
  searchInput.value = ''
}

const fetchTableData = async (page: number = 1, per_page: number = 6, state: State = 'paid') => {
  isLoadingTable.value = true
  try {
    const data = await paymentsService.GetPayments({
      page,
      state,
      perPage: per_page ?? 6
    })
    hasNextPage.value = !!data.next_page_url
    hasPrevPage.value = !!data.prev_page_url
    totalItems.value = data.total
    resetFilters()
    tableData.value = formatPaymentTableData((data.data as unknown as Payment[]) ?? [])
    tableDataCopy.value = formatPaymentTableData((data.data as unknown as Payment[]) ?? [])
    console.log({ tableDataLogPaid: tableDataCopy.value })
  } catch (err: any) {
    console.error(err)
    errorToast(err?.message ?? 'An error occurred while fetching paid payments data')
  } finally {
    isLoadingTable.value = false
  }
}

const markItemSelected = (item: Payment) => {
  const updatedItem = { ...item, _selected: !item._selected }
  // console.log({ item })
  const updatedTableData = tableData.value.map((tableItem) => {
    if (tableItem.id === updatedItem.id) {
      return updatedItem
    }
    return tableItem
  })

  const marked = updatedTableData
    .filter((tableItem) => tableItem._selected)
    .map((tableItem) => tableItem.id)

  //console.log({ marked })

  setSelectedPayments(marked)

  tableData.value = updatedTableData
}

const handlePaymentStatusChange = (payment_status: string) => {
  selectedPaymentStatus.value = payment_status

  if (payment_status === 'all') {
    tableData.value = tableDataCopy.value
  } else {
    tableData.value = tableDataCopy.value.filter((row) => {
      return row._payment_status === payment_status ? true : false
    })
  }
}

const handleUserStatusChange = (user_status: string) => {
  selectedUserStatus.value = user_status

  tableData.value = tableDataCopy.value.filter((row) => {
    const userStatusMatch =
      selectedUserStatus.value === 'all'
        ? true
        : row.user.status.toLowerCase() === user_status?.toLowerCase()

    return userStatusMatch
  })
}

const handleAmountInput = (amount_input: string) => {
  amountInput.value = amount_input
  const amountValue = amount_input
  const amountCleaned = amountValue.replace(/,/g, '')
  const amountNumber = Number(amountCleaned)

  if (amountNumber >= 0) {
    tableData.value = tableDataCopy.value.filter((row) => {
      return row.amount.toString().startsWith(amountCleaned) || row.amount >= amountNumber
    })
  } else {
    tableData.value = tableDataCopy.value
  }
}

const handleSearchInput = (search_input: string) => {
  //console.log({ search_input })
  searchInput.value = search_input

  if (!!search_input) {
    tableData.value = tableDataCopy.value.filter((row) => {
      return (
        row.user.name.toLowerCase().includes(search_input.toLowerCase()) ||
        row.user.email.toLowerCase().includes(search_input.toLowerCase())
      )
    })
  } else {
    tableData.value = tableDataCopy.value
  }
}

const handlePerPage = async (newPerPage: number) => {
  perPage.value = newPerPage
  await fetchTableData(currentPage.value, newPerPage)
}

const handleSelectedPage = async (page: number) => {
  currentPage.value = page
  await fetchTableData(currentPage.value, perPage.value)
}

onMounted(() => {
  fetchTableData()
})
</script>

<template>
  <section class="bg-white w-full rounded-2xl mt-8 flex flex-col justify-between">
    <TableFilter
      @on_payment_status_change="handlePaymentStatusChange"
      :selected-payment-status="selectedPaymentStatus"
      :selected-user-status="selectedUserStatus"
      @on_user_status_change="handleUserStatusChange"
      :amount-input="amountInput"
      @on_amount_input="handleAmountInput"
      :search-input="searchInput"
      @on_name_input="handleSearchInput"
    />

    <PaymentTable
      :tableData="tableData"
      :isLoadingTable="isLoadingTable"
      :table-type="'paid'"
      :mark-item-selected="markItemSelected"
    />

    <main
      class="w-full flex items-center justify-between pb-6 pt-8 pl-8 pr-4"
      v-if="!isLoadingTable && tableData.length > 0"
    >
      <Pagination
        :total-items="totalItems"
        :per-pages="[6, 10, 20]"
        :per-page="perPage"
        :currentPage="currentPage"
        @per_page_change="handlePerPage"
        @current_page_change="handleSelectedPage"
      />
    </main>
  </section>
</template>
