<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'

import avatar from '@/assets/images/avatar.png'
import { ref, watch } from 'vue'
import { usePaymentsStore } from './stores/payments'
import paymentsService from './services/payments.service'
import { errorToast, successToast } from './shared/utils'

const tabs = [
  { name: 'All', href: '/', current: false },
  { name: 'Paid', href: '/paid', current: false },
  { name: 'Unpaid', href: '/unpaid', current: true },
  { name: 'Overdue', href: '/overdue', current: false }
]

const tab = ref(tabs[0].href)
const router = useRouter()

const isPayingDues = ref(false)

const handlePayDues = async () => {
  const { selectedPayments } = usePaymentsStore()
  // console.log({ selectedPayments })
  if (selectedPayments.length === 0) {
    return errorToast('Please select payments to make paid')
  }
  try {
    const response = await paymentsService.MakePayment(selectedPayments)
    // console.log({ response })
    if (response.message === 'success') {
      successToast('Payment successful')
    }
    // FIXME: this could easily have been handle with tanstack query,which won't require a page reload
    window.location.reload()
    // successToast()
  } catch (error: any) {
    errorToast(error.message)
  }
}

watch(tab, (newTab) => {
  // console.log(tab)
  if (!!newTab && newTab !== router.currentRoute.value.path) {
    // tab.value.current = tab.value.href === router.currentRoute.value.path
    router.push(newTab)
  }
  // tab.current = tab.href === router.currentRoute.value.path
})
</script>

<template>
  <main class="w-full h-full bg-apex-light-white min-h-screen">
    <header class="bg-white w-full flex justify-between items-center h-24 px-12 sm:px-24 py-2">
      <h4 class="text-apex-black font-bold text-2xl">Table Headings</h4>

      <nav class="flex items-center gap-4 justify-between">
        <div class="w-12 h-12 rounded-full">
          <img :src="avatar" alt="avatar" class="w-full h-full rounded-full" />
        </div>
        <div class="flex flex-col items-start justify-between">
          <h2 class="text-apex-black font-bold text-lg tracking-[0.3px] leading-6">
            Tynisha&nbsp;Obey
          </h2>
          <h4 class="text-apex-grey text-xs leading-5 font-normal">Makostore</h4>
        </div>
      </nav>
    </header>

    <section class="w-full p-12 sm:p-24">
      <section class="w-full flex items-center justify-between">
        <div class="flex items-center justify-start w-full">
          <div class="sm:hidden">
            <label for="tabs" class="sr-only">Select a tab</label>
            <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
            <select
              id="tabs"
              name="tabs"
              v-model="tab"
              class="block w-full rounded-md border border-apex-grey-2 py-2 pl-3 pr-10 text-base focus:border-apex-green focus:outline-none focus:ring-apex-green sm:text-sm"
            >
              <option v-for="tab in tabs" :key="tab.name" :selected="tab.current" :value="tab.href">
                {{ tab.name }}
              </option>
            </select>
          </div>

          <div class="hidden sm:block w-3/5">
            <div class="border-b border-gray-200">
              <nav class="flex space-x-8" aria-label="Tabs">
                <RouterLink
                  v-for="tab in tabs"
                  :key="tab.name"
                  :to="tab.href"
                  :class="[
                    tab.href === router.currentRoute.value.path
                      ? 'border-apex-green text-apex-green font-medium'
                      : 'border-transparent text-apex-grey-deep  font-normal hover:border-apex-green hover:text-apex-green',
                    'whitespace-nowrap border-b-2 py-3 px-2 text-sm font-apex block'
                  ]"
                  :aria-current="tab.href === router.currentRoute.value.path ? 'page' : undefined"
                  >{{ tab.name }}</RouterLink
                >
              </nav>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="rounded-xl bg-apex-green px-5 py-2 h-14 w-64 text-base font-bold text-white tracking-[0.3px] leading-6 text-center shadow-sm hover:bg-apex-green/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apex-green/90 disable:opacity-50 disable:cursor-not-allowed"
          :disabled="isPayingDues"
          @:click="handlePayDues"
        >
          Pay Dues
        </button>
      </section>

      <section class="w-full">
        <RouterView />
      </section>
    </section>
  </main>
</template>
