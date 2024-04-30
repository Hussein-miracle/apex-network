<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'

import avatar from '@/assets/images/avatar.png'

const tabs = [
  { name: 'All', href: '/', current: false },
  { name: 'Paid', href: '/paid', current: false },
  { name: 'Unpaid', href: '/unpaid', current: true },
  { name: 'Overdue', href: '/overdue', current: false }
]
const router = useRouter()
</script>

<template>
  <main class="w-full h-full bg-apex-light-white min-h-screen mx-auto bg-red-500">
    <header class="bg-white w-full flex justify-between items-center h-24 px-24 py-2">
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

    <section class="w-full bg-yellow-300 p-24">
      <section class="w-full flex items-center justify-between bg-red-300">
        <div class="flex items-center justify-start w-full">
          <div class="sm:hidden">
            <label for="tabs" class="sr-only">Select a tab</label>
            <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
            <select
              id="tabs"
              name="tabs"
              class="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-apex-green focus:outline-none focus:ring-apex-green sm:text-sm"
            >
              <option v-for="tab in tabs" :key="tab.name" :selected="tab.current">
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
          class="rounded-xl bg-apex-green px-5 py-2 h-14 w-64 text-base font-bold text-white tracking-[0.3px] leading-6 text-center shadow-sm hover:bg-apex-green/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apex-green/90"
        >
          Pay Dues
        </button>
      </section>

      <section class="bg-purple-500 w-full">
        <RouterView />
      </section>
    </section>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}
</style>
