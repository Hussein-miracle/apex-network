<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue'
import paymentsService from '@/services/payments.service'
import type { Payment, PaymentStatus as PSType, State, StatusItem } from '@/shared/types'
import {
  addThousandSeparator,
  convertIsoDateToFormattedDate,
  convertDatesToPaymentStatus,
  pxToRem,
  formatPaymentTableData,
  generateArray,
  handleDisableLettersAndMultipleDecimal,
  removeItemFromString,
  errorToast
} from '@/shared/utils'
import { PAYMENT_STATUSES, USER_STATUSES } from '@/shared/constants'
import PaymentTable from '@/components/PaymentTable.vue'
import TableFilter from '@/components/TableFilter.vue'

import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption
} from '@headlessui/vue'

import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import IconChevronUpDown from '@/components/icons/IconChevronUpDown.vue'
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
const perPages = ref<number[]>([6, 10, 20])
const renderedPages = ref<number[]>([])
const total = ref<number>(0)
const maxPagesShown = ref<number>(20)

const hasNextPage = ref<null | boolean>(null)
const hasPrevPage = ref<null | boolean>(null)
const totalPages = ref(Math.ceil(total.value / perPage.value))

const getPages = () => {
  const difference = Math.floor(maxPagesShown.value / 2)
  let evenOffset = maxPagesShown.value % 2 === 0 ? 1 : 0

  if (currentPage.value + difference >= totalPages.value) {
    return generateArray(totalPages.value - maxPagesShown.value + 1, totalPages.value)
  }
  if (currentPage.value - difference <= 0) {
    return generateArray(1, maxPagesShown.value)
  }

  return generateArray(currentPage.value - difference + evenOffset, currentPage.value + difference)
}

const resetFilters = async () => {
  selectedPaymentStatus.value = PAYMENT_STATUSES[0].value
  selectedUserStatus.value = USER_STATUSES[0].value
  amountInput.value = ''
  searchInput.value = ''
}

const fetchTableData = async (page: number = 1, per_page: number = 6, state: State = 'all') => {
  isLoadingTable.value = true
  try {
    const data = await paymentsService.GetPayments({
      page: page ?? 1,
      perPage: per_page ?? 6,
      state: state ?? 'all'
    })
    //  console.log({ tableDataLog: data })
    hasNextPage.value = !!data.next_page_url
    hasPrevPage.value = !!data.prev_page_url
    total.value = data.total

    totalPages.value = Math.ceil(total.value / perPage.value)

    // console.log({ totalPages: totalPages.value })

    resetFilters()
    tableData.value = formatPaymentTableData((data.data as unknown as Payment[]) ?? [])
    tableDataCopy.value = formatPaymentTableData((data.data as unknown as Payment[]) ?? [])
    // console.log({ total: total.value })
    // console.log({ tableData: tableData.value })

    // console.log({ renderedPages: renderedPages.value })
    renderedPages.value = getPages()
  } catch (err: any) {
    console.error(err)
    errorToast(err?.message ?? 'An error occurred while fetching payments data')
  } finally {
    isLoadingTable.value = false
  }
}

//calculating total pages

// console.log({ totalPages: totalPages.value })

const handleBreakpoint = async () => {
  currentPage.value += Math.ceil(maxPagesShown.value / 2) - 1
  await fetchTableData(currentPage.value, perPage.value)
}

const handleSelectedPage = async (page: number) => {
  currentPage.value = page
  await fetchTableData(currentPage.value, perPage.value)
}

const handleNextPage = async () => {
  if (currentPage.value >= totalPages.value) return
  currentPage.value += 1
  await fetchTableData(currentPage.value, perPage.value)
}

const handlePrevPage = async () => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  await fetchTableData(currentPage.value, perPage.value)
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

  tableData.value = tableDataCopy.value.filter((row) => {
    const paymentStatusMatch =
      selectedPaymentStatus.value === 'all'
        ? true
        : convertDatesToPaymentStatus(row.payment_expected_at, row.payment_made_at) ===
          selectedPaymentStatus.value
  })
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
  console.log({ search_input })
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

onMounted(() => {
  fetchTableData()
})

watch(perPage, async (newPerPage: number) => {
  await fetchTableData(currentPage.value, newPerPage)
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
      :table-type="'all'"
      :mark-item-selected="markItemSelected"
    />

    <main
      class="w-full flex items-center justify-between pb-6 pt-8 pl-8 pr-4"
      v-if="
        (!isLoadingTable && tableData.length > 0) || (!isLoadingTable && currentPage <= totalPages)
      "
    >
      <!-- <Pagination :total-items="total" /> -->

      <div class="flex items-center justify-between w-full">
        <div class="flex flex-1 justify-between sm:hidden">
          <button
            type="button"
            :disabled="!hasPrevPage && currentPage === 1"
            @click="handlePrevPage"
            class="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-apex-light-green hover:text-apex-green border-apex-grey-2 border"
          >
            Previous
          </button>
          <button
            :disabled="!hasNextPage"
            @click="handleNextPage"
            type="button"
            class="relative inline-flex items-center rounded-md px-2 py-2 text-gray-400 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-apex-light-green hover:text-apex-green border-apex-grey-2 border"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-apex-grey flex items-center gap-1">
              <span>Show Result:</span>&nbsp;
              <Listbox v-slot="{ open }" v-model="perPage">
                <div
                  class="relative mt-1 w-[4.25rem] border border-solid border-apex-grey-2 rounded-lg"
                >
                  <ListboxButton
                    class="relative w-full cursor-pointer rounded-lg bg-white py-2 px-3 text-left focus:outline-none sm:text-sm"
                  >
                    <span class="block truncate text-apex-black font-bold font-apex">{{
                      perPage
                    }}</span>
                    <span
                      class="pointer-events-none absolute inset-y-0 right-0 flex items-center -translate-x-3 rotate-0 origin-center transition-transform"
                      :class="{ 'rotate-180': open }"
                    >
                      <IconChevronUpDown class="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </ListboxButton>

                  <transition
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <ListboxOptions
                      class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm"
                    >
                      <ListboxOption
                        v-slot="{ active, selected }"
                        v-for="page in perPages"
                        :key="page"
                        :value="page"
                        as="template"
                      >
                        <li
                          :class="[
                            active ? 'bg-apex-light-green text-apex-green' : 'text-gray-900',
                            'relative cursor-pointer select-none py-2 px-3'
                          ]"
                        >
                          <span
                            :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']"
                            >{{ page }}</span
                          >
                          <!-- <span
                      v-if="selected"
                      class="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600"
                    >
                      <CheckIcon class="h-5 w-5" aria-hidden="true" />
                    </span> -->
                        </li>
                      </ListboxOption>
                    </ListboxOptions>
                  </transition>
                </div>
              </Listbox>
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex" aria-label="Pagination">
              <button
                type="button"
                :disabled="!hasPrevPage && currentPage === 1"
                @click="handlePrevPage"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 focus:z-20 focus:outline-offset-0 w-10 h-10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Previous</span>
                <IconChevronLeft class="h-5 w-5" aria-hidden="true" />
              </button>
              <!-- Current: "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900   focus:outline-offset-0" -->

              <button
                v-for="page in renderedPages.slice(0, 4)"
                type="button"
                aria-current="page"
                class="relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold hover:bg-apex-light-green hover:text-apex-green w-10 h-10 rounded-xl"
                :class="{ 'bg-apex-light-green text-apex-green ': page === currentPage }"
                @click="handleSelectedPage(page)"
              >
                {{ page }}
              </button>
              <span
                @click="handleBreakpoint"
                class="relative cursor-pointer inline-flex items-center px-4 py-2 text-sm font-semibold hover:bg-apex-light-green hover:text-apex-green w-10 h-10 rounded-xl"
                >...</span
              >

              <button
                type="button"
                aria-current="page"
                class="relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold hover:bg-apex-light-green hover:text-apex-green w-10 h-10 rounded-xl"
                :class="{
                  'bg-apex-light-green text-apex-green ':
                    renderedPages[renderedPages.length - 1] === currentPage
                }"
                @click="handleSelectedPage(renderedPages[renderedPages.length - 1])"
              >
                {{ renderedPages[renderedPages.length - 1] }}
              </button>

              <button
                :disabled="!hasNextPage"
                @click="handleNextPage"
                type="button"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 focus:z-20 focus:outline-offset-0 w-10 h-10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Next</span>
                <IconChevronRight class="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </main>
  </section>
</template>
