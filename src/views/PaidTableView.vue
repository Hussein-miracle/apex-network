<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue'
import paymentsService from '@/services/payments.service'
import type { Payment, State, StatusItem, } from '@/shared/types'
import {
  addThousandSeparator,
  convertIsoDateToFormattedDate,
  convertDatesToPaymentStatus,
  pxToRem,
  formatPaymentTableData,
  generateArray,
  errorToast
} from '@/shared/utils'
import { PAYMENT_STATUSES, USER_STATUSES } from '@/shared/constants'
import IconMore from '@/components/icons/IconMore.vue'
import IconClosePopUp from '@/components/icons/IconClosePopUp.vue'
import PaymentStatus from '@/components/PaymentStatus.vue'
import UserStatus from '@/components/UserStatus.vue'
import TableRowCheck from '@/components/TableRowCheck.vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import TableSkeleton from '@/components/TableSkeleton.vue'
import TableFilter from '@/components/TableFilter.vue';

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

let isLoadingTable = ref<boolean>(false)
const tableData = ref<Payment[]>([])
const tableDataCopy = ref<Payment[]>([])

// FILTERS
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

const resetFilters = async () => {
  selectedPaymentStatus.value = PAYMENT_STATUSES[0].value
  selectedUserStatus.value = USER_STATUSES[0].value
  amountInput.value = ''
  searchInput.value = ''
  // await fetchTableData(currentPage.value, perPage.value);
}

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

const fetchTableData = async (page: number = 1, per_page: number = 6, state: State = 'paid') => {
  isLoadingTable.value = true
  try {
    const data = await paymentsService.GetPayments({
      page,
      perPage: per_page,
      state: state ?? 'paid'
    })
    // console.log({ tableDataLog: data })
    hasNextPage.value = !!data.next_page_url
    hasPrevPage.value = !!data.prev_page_url
    total.value = data.total

    totalPages.value = Math.ceil(total.value / perPage.value)

    // console.log({ totalPages: totalPages.value })

    resetFilters()

    tableData.value = formatPaymentTableData((data.data as unknown as Payment[]) ?? [])
    // console.log({ tableData: tableData.value })
    tableDataCopy.value = tableData.value
    renderedPages.value = getPages()
  } catch (err: any) {
    console.error(err)
    errorToast(err?.message ?? 'An error occurred while fetching payments data')
  } finally {
    isLoadingTable.value = false
  }
}
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

    <section class="my-4 flow-root">
      <div class="overflow-auto">
        <div class="inline-block min-w-full py-2 align-middle">
          <table class="min-w-full divide-y divide-apex-grey-2 border-y border-y-apex-grey-2">
            <thead>
              <tr class="">
                <th
                  scope="col"
                  class="py-6 pl-16 pr-3 text-left text-base font-medium text-apex-table-header"
                >
                  Name
                </th>
                <th
                  scope="col"
                  class="px-3 py-6 text-left text-base font-medium text-apex-table-header"
                >
                  User&nbsp;Status
                </th>
                <th
                  scope="col"
                  class="px-3 py-6 text-left text-base font-medium text-apex-table-header"
                >
                  Payment&nbsp;Status
                </th>
                <th
                  scope="col"
                  class="px-3 py-6 text-left text-base font-medium text-apex-table-header"
                >
                  Amount
                </th>
                <th scope="col" class="relative py-6 pl-3 pr-8">
                  <span class="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <TableSkeleton v-if="isLoadingTable" />
            <tbody class="divide-y divide-apex-grey-2" v-else-if="!isLoadingTable && !!tableData">
              <template v-if="tableData.length > 0">
                <tr
                  v-for="transaction in tableData"
                  :key="transaction.id"
                  class="hover:bg-apex-table-highlight last-of-type:border-b last-of-type:border-apex-grey-2"
                >
                  <td class="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900">
                    <div class="flex items-center gap-6">
                      <TableRowCheck
                        :checked="transaction._selected"
                        @click="markItemSelected(transaction)"
                      />
                      <div class="flex flex-col items-start gap-2">
                        <div class="text-base font-semibold text-apex-black">
                          {{ transaction?.user?.name }}
                        </div>
                        <div
                          class="text-base font-medium leading-6 tracking-[0.3px] text-apex-content-secondary"
                        >
                          {{ transaction?.user?.email }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-2 text-sm">
                    <div class="flex flex-col gap-2 items-start">
                      <UserStatus :user_status="transaction?.user?.status" />
                      <div class="text-base font-medium text-apex-content-body">
                        Last Login:
                        <span class="text-base font-medium text-apex-content-body">{{
                          convertIsoDateToFormattedDate(transaction?.user?.last_login_at)
                        }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-2 text-sm">
                    <div class="flex flex-col gap-2 items-start">
                      <PaymentStatus
                        :payment_status="
                          convertDatesToPaymentStatus(
                            transaction.payment_expected_at,
                            transaction.payment_made_at
                          )
                        "
                      />
                      <div class="text-base font-medium text-apex-content-body">
                        Paid On:
                        <span class="text-base font-medium text-apex-content-body">{{
                          convertIsoDateToFormattedDate(transaction?.payment_made_at)
                        }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-3 py-2">
                    <div class="flex flex-col gap-2 items-start">
                      <div class="text-apex-black font-semibold leading-6 tracking-[0.3px]">
                        ${{ addThousandSeparator((transaction?.amount ?? 0)?.toString(), ',') }}
                      </div>
                      <div class="uppercase text-apex-content-secondary text-base font-medium">
                        {{ transaction?.currency }}
                      </div>
                    </div>
                  </td>
                  <td
                    class="relative whitespace-nowrap py-2 pl-3 pr-8 text-right text-sm font-medium"
                  >
                    <Popover v-slot="{ open }" class="relative" id="{{ transaction?.id }}">
                      <PopoverButton
                        class="group inline-flex items-center rounded-md text-base outline-none focus:outline-none"
                      >
                        <div class="cursor-pointer">
                          <IconMore />
                        </div>
                      </PopoverButton>

                      <transition
                        enter-active-class="transition duration-200 ease-out"
                        enter-from-class="translate-y-1 opacity-0"
                        enter-to-class="translate-y-0 opacity-100"
                        leave-active-class="transition duration-150 ease-in"
                        leave-from-class="translate-y-0 opacity-100"
                        leave-to-class="translate-y-1 opacity-0"
                      >
                        <PopoverPanel class="absolute right-2 z-20 w-fit" v-slot="{ close }">
                          <div
                            class="rounded-full cursor-pointer w-5 h-5 flex items-center justify-center absolute -right-1.5 -top-1.5 z-10 transform transition-transform delay-300 ease-in-out"
                            :class="{ 'rotate-0': open, 'rotate-180': !open }"
                            @click="close"
                          >
                            <IconClosePopUp />
                          </div>
                          <div
                            class="overflow-hidden rounded-md bg-white drop-shadow-lg relative flex flex-col items-center justify-between gap-2 text-start text-sm font-medium px-2 py-3"
                            :style="{ width: pxToRem(156) }"
                          >
                            <div class="flex flex-col items-center text-start w-full">
                              <div
                                class="text-apex-content-body hover:bg-apex-light-green transition-colors ease-in-out duration-100 w-full px-2 py-1 rounded cursor-pointer"
                              >
                                Edit
                              </div>
                              <div
                                class="text-apex-content-body hover:bg-apex-light-green transition-colors ease-in-out duration-100 w-full px-2 py-1 rounded cursor-pointer"
                              >
                                View&nbsp;Profile
                              </div>
                            </div>
                            <div class="bg-accent-blue-50 h-[1px] w-full" />
                            <div class="text-start w-full">
                              <div
                                class="text-apex-danger hover:font-semibold hover:bg-apex-black transition-colors ease-in-out duration-100 w-full px-2 py-1 rounded cursor-pointer"
                              >
                                Delete
                              </div>
                            </div>
                          </div>
                        </PopoverPanel>
                      </transition>
                    </Popover>
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr>
                  <td
                    class="pb-4 pt-8 px-6 text-center text-base font-semibold text-apex-content-body"
                    colspan="5"
                  >
                    <div>No paid payments data available.</div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </section>

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
