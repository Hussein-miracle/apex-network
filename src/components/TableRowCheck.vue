<script setup lang="ts">
import IconMarkRound from './icons/IconMarkRound.vue'

const props = defineProps({
  checked: {
    type: Boolean,
    required: false
  }
})
</script>

<template>
  <div
    class="w-5 h-5 border border-apex-table-checkmark rounded-full bg-white cursor-pointer overflow-hidden flex items-center justify-center"
  >
    <IconMarkRound v-if="checked" class="w-5 h-5" :checked="checked" />
  </div>
</template>
