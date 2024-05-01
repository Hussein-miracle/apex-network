<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from 'vue'
import paymentsService from '@/services/payments.service'
import type { Payment, PaymentStatusItem, State, UserStatusItem } from '@/shared/types'
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
import { useToggle } from '@/shared/hooks'
import IconFilterVue from '@/components/icons/IconFilter.vue'
// import Pagination from '@/components/Pagination.vue'
import IconMore from '@/components/icons/IconMore.vue'
import IconClosePopUp from '@/components/icons/IconClosePopUp.vue'
import PaymentStatus from '@/components/PaymentStatus.vue'
import UserStatus from '@/components/UserStatus.vue'
import TableRowCheck from '@/components/TableRowCheck.vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import TableSkeleton from '@/components/TableSkeleton.vue'

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

let isLoadingPaidTable = ref<boolean>(false)
const paidTableData = ref<Payment[]>([])
const paidTableDataCopy = ref<Payment[]>([])

const { value: showFilters, toggle: toggleFilters } = useToggle()
const selectedPaymentStatus = ref<PaymentStatusItem['value']>(PAYMENT_STATUSES[0].value)
const selectedUserStatus = ref<UserStatusItem['value']>(USER_STATUSES[0].value)
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
  // await fetchpaidTableData(currentPage.value, perPage.value);
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

const fetchPaidTableData = async (
  page: number = 1,
  per_page: number = 6,
  state: State = 'overdue'
) => {
  isLoadingPaidTable.value = true
  try {
    const data = await paymentsService.GetPayments({
      page,
      perPage: per_page,
      state: state ?? 'overdue'
    })
    // console.log({ paidTableDataLog: data })
    hasNextPage.value = !!data.next_page_url
    hasPrevPage.value = !!data.prev_page_url
    total.value = data.total

    totalPages.value = Math.ceil(total.value / perPage.value)

    // console.log({ totalPages: totalPages.value })

    resetFilters()

    paidTableData.value = formatPaymentTableData((data.data as unknown as Payment[]) ?? [])
    console.log({ paidTableData: paidTableData.value })
    paidTableDataCopy.value = paidTableData.value
    renderedPages.value = getPages()
  } catch (err: any) {
    console.error(err)
    errorToast(err?.message ?? 'An error occurred while fetching payments data')
  } finally {
    isLoadingPaidTable.value = false
  }
}
const handleBreakpoint = async () => {
  currentPage.value += Math.ceil(maxPagesShown.value / 2) - 1
  await fetchPaidTableData(currentPage.value, perPage.value)
}

const handleSelectedPage = async (page: number) => {
  currentPage.value = page
  await fetchPaidTableData(currentPage.value, perPage.value)
}

const handleNextPage = async () => {
  if (currentPage.value >= totalPages.value) return
  currentPage.value += 1
  await fetchPaidTableData(currentPage.value, perPage.value)
}

const handlePrevPage = async () => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  await fetchPaidTableData(currentPage.value, perPage.value)
}

const handleAmountChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = target.value
  // console.log({ value })

  let parts = value
  let partsString = removeItemFromString(parts, ',')

  partsString = partsString.startsWith('0') ? partsString.slice(1) : partsString

  const includesDecimal = partsString.includes('.')

  if (includesDecimal) {
    const partsSplit = partsString.split('.')
    partsSplit[0] = addThousandSeparator(partsSplit[0], ',')
    parts = partsSplit.join('.')
  } else {
    parts = addThousandSeparator(partsString, ',')
  }

  // const amount = Number(partsString)

  amountInput.value = parts
}

const markItemSelected = (item: Payment) => {
  const updatedItem = { ...item, _selected: !item._selected }
  // console.log({ item })
  const updatedTableData = paidTableData.value.map((tableItem) => {
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

  paidTableData.value = updatedTableData
}

onMounted(() => {
  fetchPaidTableData()
})

watch(perPage, async (newPerPage: number) => {
  await fetchPaidTableData(currentPage.value, newPerPage)
})

watch([searchInput, perPage], async ([newSearchInput]) => {
  const search = newSearchInput.toLowerCase()

  // console.log({ search })
  //     const amountMatch = row.amount >= amountNumber
  if (search) {
    paidTableData.value = paidTableDataCopy.value.filter((row) => {
      return (
        row.user.name.toLowerCase().includes(search) ||
        row.user.email.toLowerCase().includes(search)
      )
    })
  } else {
    paidTableData.value = paidTableDataCopy.value
  }
})

watch(amountInput, async () => {
  const amountValue = amountInput.value
  const amountCleaned = amountValue.replace(/,/g, '')
  const amountNumber = Number(amountCleaned)
  console.log({ amountNumber })

  if (amountNumber >= 0) {
    paidTableData.value = paidTableDataCopy.value.filter((row) => {
      return row.amount.toString().startsWith(amountCleaned) || row.amount >= amountNumber
    })
  } else {
    paidTableData.value = paidTableDataCopy.value
  }
})

watch(
  [selectedPaymentStatus, selectedUserStatus],
  async () => {
    console.log({
      selectedPaymentStatus: selectedPaymentStatus.value,
      selectedUserStatus: selectedUserStatus.value
    })

    paidTableData.value = paidTableDataCopy.value.filter((row) => {
      const userStatusMatch =
        selectedUserStatus.value === 'all'
          ? true
          : row.user.status.toLowerCase() === selectedUserStatus.value?.toLowerCase()
      // const paymentStatusMatch =
      //   selectedPaymentStatus.value === 'all'
      //     ? true
      //     : convertDatesToPaymentStatus(row.payment_expected_at, row.payment_made_at) ===
      //       selectedPaymentStatus.value

      return userStatusMatch
    })
  },
  {
    deep: true
  }
)
</script>

<template>
  <section class="bg-white w-full rounded-2xl mt-8 flex flex-col justify-between">
    <section class="px-4 border-b border-gray-200 flex flex-col items-center gap-2">
      <main class="flex items-center justify-end pt-6 pb-4 w-full">
        <button
          class="bg-apex-light-white rounded-xl p-4 border border-apex-grey-2 flex items-center gap-2 justify-between"
          @click="toggleFilters"
        >
          <span class="text-apex-green w-6 h-6">
            <IconFilterVue />
          </span>
          <span class="text-apex-green">Filter</span>
        </button>
      </main>

      <section class="grid grid-cols-4 w-full px-4 py-6 gap-4" v-if="showFilters">
        <div class="flex flex-col items-start gap-2">
          <label for="user_name" class="text-apex-black font-bold text-base">Name</label>
          <div class="w-full rounded-xl">
            <input
              type="text"
              id="user_name"
              name="name"
              placeholder="name"
              v-model="searchInput"
              class="w-full border bg-apex-light-white rounded-md p-4 text-base text-apex-content-header placeholder:text-[#A0AEC0] outline-none focus:outline-none focus:border-apex-green focus:ring-1 focus:ring-apex-green"
            />
          </div>
        </div>
        <div class="flex flex-col items-start gap-2">
          <label for="amount" class="text-apex-black font-bold text-base">Amount</label>
          <div class="w-full rounded-xl">
            <input
              type="text"
              id="amount"
              name="amount"
              placeholder="1,000"
              :value="amountInput"
              @keydown="handleDisableLettersAndMultipleDecimal"
              @input="handleAmountChange"
              class="w-full border bg-apex-light-white rounded-md p-4 text-base text-apex-content-header placeholder:text-[#A0AEC0] outline-none focus:outline-none focus:border-apex-green focus:ring-1 focus:ring-apex-green"
            />
          </div>
        </div>
        <!-- <div class="flex flex-col items-start gap-2 w-full">
          <Listbox
            as="div"
            v-model="selectedAmountFilter"
            v-slot="{ open }"
            class="w-full flex justify-between flex-col items-start gap-2"
          >
            <ListboxLabel class="block leading-6 text-apex-black font-bold text-base">
              Amount</ListboxLabel
            >
            <div class="relative w-full">
              <ListboxButton
                class="relative cursor-pointer py-4 pl-4 pr-10 text-left shadow-sm sm:text-sm sm:leading-6 w-full border bg-apex-light-white rounded-md p-4 text-base text-apex-content-header placeholder:text-[#A0AEC0] outline-none focus:outline-none focus:border-apex-green focus:ring-1 focus:ring-apex-green"
              >
                <span
                  class="block truncate text-base font-medium text-apex-content-header capitalize"
                  >{{ selectedAmountFilter?.label }}&nbsp;</span
                >

                <span
                  class="pointer-events-none absolute inset-y-0 flex items-center origin-center right-2 transition-transform duration-150 ease-out rotate-0"
                  :class="{ 'rotate-180': open, 'rotate-0': !open }"
                >
                  <IconChevronUpDown class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>

              <transition
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <ListboxOptions
                  class="absolute z-10 mt-1 w-full overflow-auto rounded-md bg-white text-base shadow-lg focus:outline-none p-2 h-fit styled-scroll"
                >
                  <ListboxOption
                    as="template"
                    v-for="amount_filter in AMOUNT_FILTERS"
                    :key="amount_filter.value"
                    :value="amount_filter"
                    v-slot="{ active, selected }"
                  >
                    <li
                      :class="[
                        active ? 'bg-[#F9FAFB]' : 'bg-transparent',
                        'relative cursor-pointer select-none pl-2 pr-4 py-4 text-base text-apex-black rounded-xl'
                      ]"
                    >
                      <div class="flex items-start gap-1.5 w-full">
                        <span
                          class="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                          :class="{
                            'bg-apex-green': amount_filter.value === 'active',
                            'bg-apex-orange': amount_filter.value === 'inactive'
                          }"
                          aria-hidden="true"
                        />
                        <span
                          class="block truncate"
                          :class="{
                            'text-apex-green': amount_filter.value === 'active',
                            'text-apex-orange': amount_filter.value === 'inactive',
                            'font-semibold': selected,
                            'font-normal': !selected
                          }"
                        >
                          {{ amount_filter.label }}
                        </span>
                      </div>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>
        </div> -->
        <div class="flex flex-col items-start gap-2 w-full">
          <Listbox
            as="div"
            v-model="selectedUserStatus"
            v-slot="{ open }"
            class="w-full flex justify-between flex-col items-start gap-2"
          >
            <ListboxLabel class="block leading-6 text-apex-black font-bold text-base">
              User's&nbsp;Status</ListboxLabel
            >
            <div class="relative w-full">
              <ListboxButton
                class="relative cursor-pointer py-4 pl-4 pr-10 text-left shadow-sm sm:text-sm sm:leading-6 w-full border bg-apex-light-white rounded-md p-4 text-base text-apex-content-header placeholder:text-[#A0AEC0] outline-none focus:outline-none focus:border-apex-green focus:ring-1 focus:ring-apex-green"
              >
                <span
                  class="block truncate text-base font-medium text-apex-content-header capitalize"
                  >{{ selectedUserStatus }}&nbsp;</span
                >

                <span
                  class="pointer-events-none absolute inset-y-0 flex items-center origin-center right-2 transition-transform duration-150 ease-out rotate-0"
                  :class="{ 'rotate-180': open, 'rotate-0': !open }"
                >
                  <IconChevronUpDown class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>

              <transition
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <ListboxOptions
                  class="absolute z-10 mt-1 w-fit sm:w-full overflow-auto rounded-md bg-white text-base shadow-lg focus:outline-none sm:text-sm p-2 h-fit styled-scroll flex flex-col items-start"
                >
                  <!-- :style="{ height: pxToRem(224) }" -->
                  <ListboxOption
                    as="template"
                    v-for="user_status in USER_STATUSES"
                    :key="user_status.value"
                    :value="user_status.value"
                    v-slot="{ active, selected }"
                  >
                    <li
                      :class="[
                        active ? 'bg-[#F9FAFB]' : 'bg-transparent',
                        'relative cursor-pointer select-none sm:pl-2 pr-4 py-4 text-base text-apex-black rounded-xl w-full'
                      ]"
                    >
                      <div class="flex items-center justify-start gap-1.5 w-full">
                        <span
                          class="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                          :class="{
                            'bg-apex-green ml-2 sm:ml-4': user_status.value === 'active',
                            'bg-apex-orange ml-2 sm:ml-4': user_status.value === 'inactive'
                          }"
                          aria-hidden="true"
                        />
                        <span
                          class="block truncate"
                          :class="{
                            'text-apex-green': user_status.value === 'active',
                            'text-apex-orange': user_status.value === 'inactive',
                            'font-semibold': selected,
                            'font-normal': !selected
                          }"
                        >
                          {{ user_status.label }}
                        </span>
                      </div>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>
        </div>
        <div class="flex flex-col items-start gap-2 w-full">
          <Listbox
            as="div"
            v-model="selectedPaymentStatus"
            v-slot="{ open }"
            class="w-full flex justify-between flex-col items-start gap-2"
          >
            <ListboxLabel class="block leading-6 text-apex-black font-bold text-base"
              >Payment&nbsp;Status</ListboxLabel
            >
            <div class="relative w-full">
              <ListboxButton
                class="relative cursor-pointer py-4 pl-4 pr-10 text-left shadow-sm sm:text-sm sm:leading-6 w-full border bg-apex-light-white rounded-md p-4 text-base text-apex-content-header placeholder:text-[#A0AEC0] outline-none focus:outline-none focus:border-apex-green focus:ring-1 focus:ring-apex-green"
              >
                <span
                  class="block truncate text-base font-medium text-apex-content-header capitalize"
                  >{{ selectedPaymentStatus }}&nbsp;</span
                >

                <span
                  class="pointer-events-none absolute inset-y-0 flex items-center origin-center right-2 transition-transform duration-150 ease-out rotate-0"
                  :class="{ 'rotate-180': open, 'rotate-0': !open }"
                >
                  <IconChevronUpDown class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>

              <transition
                leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <ListboxOptions
                  class="absolute z-10 mt-1 w-fit sm:w-full overflow-auto rounded-md bg-white text-base shadow-lg focus:outline-none sm:text-sm p-2 h-fit styled-scroll"
                >
                  <!-- :style="{ height: pxToRem(224) }" -->
                  <ListboxOption
                    as="template"
                    v-for="payment_status in PAYMENT_STATUSES"
                    :key="payment_status.value"
                    :value="payment_status.value"
                    v-slot="{ active, selected }"
                  >
                    <li
                      :class="[
                        active ? 'bg-[#F9FAFB]' : 'bg-transparent',
                        'relative cursor-pointer select-none pl-2 pr-4 py-4 text-base text-apex-black rounded-xl'
                      ]"
                    >
                      <div class="flex items-center gap-1.5 w-full">
                        <span
                          class="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                          :class="{
                            'bg-apex-unpaid ml-4': payment_status.value === 'unpaid',
                            'bg-apex-paid ml-4': payment_status.value === 'paid',
                            'bg-apex-overdue ml-4': payment_status.value === 'overdue'
                          }"
                          aria-hidden="true"
                        />
                        <span
                          class="block truncate"
                          :class="{
                            'text-apex-unpaid': payment_status.value === 'unpaid',
                            'text-apex-paid': payment_status.value === 'paid',
                            'text-apex-overdue': payment_status.value === 'overdue',
                            'font-semibold': selected,
                            'font-normal': !selected
                          }"
                        >
                          {{ payment_status.label }}
                        </span>
                      </div>
                    </li>
                  </ListboxOption>
                </ListboxOptions>
              </transition>
            </div>
          </Listbox>
        </div>
      </section>
    </section>

    <section class="my-4 flow-root">
      <div class="overflow-auto">
        <div class="inline-block min-w-full py-2 align-middle">
          <table class="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  class="py-1.5 pl-16 pr-3 text-left text-base font-medium text-apex-table-header"
                >
                  Name
                </th>
                <th
                  scope="col"
                  class="px-3 py-1.5 text-left text-base font-medium text-apex-table-header"
                >
                  User&nbsp;Status
                </th>
                <th
                  scope="col"
                  class="px-3 py-1.5 text-left text-base font-medium text-apex-table-header"
                >
                  Payment&nbsp;Status
                </th>
                <th
                  scope="col"
                  class="px-3 py-1.5 text-left text-base font-medium text-apex-table-header"
                >
                  Amount
                </th>
                <th scope="col" class="relative py-1.5 pl-3 pr-8">
                  <span class="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <TableSkeleton v-if="isLoadingPaidTable" />
            <tbody
              class="divide-y divide-apex-grey-2"
              v-else-if="!isLoadingPaidTable && !!paidTableData"
            >
              <template v-if="paidTableData.length > 0">
                <tr
                  v-for="transaction in paidTableData"
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
      class="w-full flex items-center justify-between border-t border-gray-200 pb-6 pt-8 pl-8 pr-4"
      v-if="
        (!isLoadingPaidTable && paidTableData.length > 0) ||
        (!isLoadingPaidTable && currentPage <= totalPages)
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
