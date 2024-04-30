<script setup lang="ts">
import { onMounted, ref } from 'vue'
import paymentsService from '@/services/payments.service'
import type { Payment } from '@/shared/types'
import {
  addThousandSeparator,
  convertIsoDateToFormattedDate,
  convertDatesToPaymentStatus,
  pxToRem,
  formatPaymentTableData
  // @ts-ignore
} from '@/shared/utils'
import IconFilterVue from '@/components/icons/IconFilter.vue'
import Pagination from '@/components/Pagination.vue'
import IconMore from '@/components/icons/IconMore.vue'
import IconClosePopUp from '@/components/icons/IconClosePopUp.vue'
import PaymentStatus from '@/components/PaymentStatus.vue'
import UserStatus from '@/components/UserStatus.vue'
import TableRowCheck from '@/components/TableRowCheck.vue'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import TableSkeleton from '@/components/TableSkeleton.vue'

let isLoadingPaidTable = ref<boolean>(false)
const paidTableData = ref<Payment[]>([])
let page = ref<number>(1)
let perPage = ref<number>(6)
let total = ref<number>(0)

const fetchPaidTableData = async (page: number = 1, perPage: number = 6) => {
  isLoadingPaidTable.value = true
  try {
    const data = await paymentsService.GetPayments({ page, perPage, state: 'paid' })
    console.log({ paidTableDataLog: data })
    paidTableData.value = formatPaymentTableData((data.data as unknown as Payment[]) ?? [])
    console.log({ paidTableData: paidTableData.value })
  } catch (err) {
    console.error(err)
  } finally {
    isLoadingPaidTable.value = false
  }
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
  paidTableData.value = updatedTableData
}

onMounted(() => {
  fetchPaidTableData()
})
</script>

<template>
  <section class="bg-white w-full rounded-2xl mt-8 flex flex-col justify-between">
    <main class="flex items-center justify-end pt-6 pb-4 px-4 border-b border-gray-200">
      <button
        class="bg-apex-light-white rounded-xl p-4 border border-apex-grey-2 flex items-center gap-2 justify-between"
      >
        <span class="text-apex-green w-6 h-6">
          <IconFilterVue />
        </span>
        <span class="text-apex-green">Filter</span>
      </button>
    </main>

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
                        <div class="text-base font-medium text-apex-black">
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
                          convertIsoDateToFormattedDate(transaction?.payment_expected_at)
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
      v-if="!isLoadingPaidTable && paidTableData.length > 0"
    >
      <Pagination />
    </main>
  </section>
</template>
