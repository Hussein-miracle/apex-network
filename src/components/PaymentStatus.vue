<script setup lang="ts">
import type { PaymentStatus } from '@/shared/types'
import type { PropType } from 'vue'

const props = defineProps({
  payment_status: {
    type: String as PropType<PaymentStatus>,
    required: true
  }
})
</script>

<template>
  <div
    class="flex items-center justify-center rounded-lg px-4 py-2 gap-1"
    :class="{
      'bg-apex-paid-light ': payment_status === 'paid',
      'bg-apex-unpaid-light': payment_status === 'unpaid',
      'bg-apex-overdue-light': payment_status === 'overdue'
    }"
  >
    <span
      :class="{
        'bg-apex-paid': payment_status === 'paid',
        'bg-apex-unpaid': payment_status === 'unpaid',
        'bg-apex-overdue': payment_status === 'overdue'
      }"
      class="w-1.5 h-1.5 rounded-full block"
    ></span>

    <span
      :class="{
        'text-apex-paid': payment_status === 'paid',
        'text-apex-unpaid': payment_status === 'unpaid',
        'text-apex-overdue': payment_status === 'overdue'
      }"
      class="font-apex font-medium text-sm capitalize"
      >{{ payment_status }}</span
    >
  </div>
</template>
