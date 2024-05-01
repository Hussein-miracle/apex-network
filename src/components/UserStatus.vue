<script setup lang="ts">
import type { UserStatus } from '@/shared/types'
import { pxToRem } from '@/shared/utils'
import type { PropType } from 'vue'

const props = defineProps({
  user_status: {
    type: String as PropType<UserStatus>,
    required: true
  }
})
</script>

<template>
  <div
    class="flex items-center justify-center rounded-lg px-4 py-2 gap-1"
    :class="{
      'bg-apex-light-green': user_status === 'active',
      'bg-apex-light-orange': user_status === 'inactive'
    }"
    :style="{ width: pxToRem(120) }"
  >
    <span
      :class="{
        'bg-apex-green': user_status === 'active',
        'bg-apex-orange': user_status === 'inactive'
      }"
      class="w-1.5 h-1.5 rounded-full block"
    ></span>

    <span
      :class="{
        'text-apex-green': user_status === 'active',
        'text-apex-orange': user_status === 'inactive'
      }"
      class="font-apex font-medium text-sm capitalize"
      >{{ user_status }}</span
    >
  </div>
</template>
