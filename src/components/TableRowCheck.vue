<script setup lang="ts">
import IconMarkRound from './icons/IconMarkRound.vue'

const props = defineProps({
  checked: Boolean
})
</script>

<template>
  <div class="w-5 h-5 border border-apex-table-checkmark rounded-full bg-white cursor-pointer">
    <IconMarkRound v-if="checked" class="w-5 h-5" />
  </div>
</template>
