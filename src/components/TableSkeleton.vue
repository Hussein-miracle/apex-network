<script setup lang="ts">
import { ref } from 'vue'

const tableData = ref<{ id: number }[]>([
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 }
])
</script>

<template>
  <tbody class="divide-y divide-apex-grey-2">
    <tr v-for="item in tableData" :key="item.id" class="hover:bg-apex-light-green/40">
      <td class="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900">
        <div class="flex items-center gap-6">
          <div class="w-5 h-5 animate-pulse bg-gray-200 rounded-full"></div>
          <div class="flex flex-col items-start gap-2">
            <div class="w-28 h-4 animate-pulse bg-gray-200 rounded-md">&nbsp;</div>
            <div class="w-24 h-4 animate-pulse bg-gray-200 rounded-md">&nbsp;</div>
          </div>
        </div>
      </td>

      <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
        <div class="flex flex-col gap-2 items-start">
          <div class="w-20 rounded-lg h-6 py-2 px-1 bg-gray-200 animate-pulse"></div>
          <div class="text-base font-medium text-apex-content-body flex items-center">
            <!-- Last Login:&nbsp; -->
            <span
              class="text-base font-medium text-apex-content-body animate-pulse w-28 h-4 py-2 block bg-gray-200 rounded-md"
              >&nbsp;</span
            >
          </div>
        </div>
      </td>
      <td class="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
        <div class="flex flex-col gap-2 items-start">
          <div class="w-20 rounded-lg h-6 py-2 px-1 bg-gray-200 animate-pulse"></div>
          <div class="text-base font-medium text-apex-content-body flex items-center">
            <!-- Paid On:&nbsp; -->
            <span
              class="text-base font-medium text-apex-content-body animate-pulse w-28 h-4 py-2 block bg-gray-200 rounded-md"
              >&nbsp;</span
            >
          </div>
        </div>
      </td>
      <td class="whitespace-nowrap px-3 py-2">
        <div class="flex flex-col gap-2 items-start">
          <div class="animate-pulse w-12 h-6 bg-gray-200 rounded-md">&nbsp;</div>
          <div class="animate-pulse w-12 h-6 bg-gray-200 rounded-md">&nbsp;</div>
        </div>
      </td>
      <td class="relative whitespace-nowrap py-2 pl-3 pr-8 text-right text-sm font-medium">
        <div class="w-8 h-5 animate-pulse bg-gray-200 rounded-lg">&nbsp;</div>
      </td>
    </tr>
  </tbody>
</template>
