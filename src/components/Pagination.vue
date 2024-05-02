<script setup lang="ts">
import { ref, type PropType, computed, toRef, watch } from 'vue'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption
} from '@headlessui/vue'
import { PAGINATION_EMITS } from '@/shared/constants'
import IconChevronLeft from './icons/IconChevronLeft.vue'
import IconChevronRight from './icons/IconChevronRight.vue'
import IconChevronUpDown from './icons/IconChevronUpDown.vue'
import { generateArray, generatePages } from '@/shared/utils'

const props = defineProps({
  perPages: {
    type: Array as PropType<number[]>,
    required: false,
    default: [10, 20, 30, 50, 100]
  },
  perPage: {
    type: Number as PropType<number>,
    required: false,
    default: 10
  },
  currentPage: {
    type: Number as PropType<number>,
    required: false,
    default: 1
  },
  totalItems: {
    type: Number as PropType<number>,
    required: true
  },
  maxPagesShown: {
    type: Number as PropType<number>,
    required: false,
    default: 5
  },
  onPerPageChange: {
    type: Function as PropType<(perPage: number) => void>,
    required: !true,
    default: (p: number) => {}
  },
  handleBreakpoint: {
    type: Function as PropType<() => void>,
    required: !true
  }
})

const totalPages = computed(() => Math.ceil(props.totalItems / props.perPage))

const selectedPage = ref<number>(props.currentPage)
const selectedPerPage = ref<number>(props.perPage)

const hasNextPage = computed(() => {
  return selectedPage.value !== totalPages.value
})
const hasPrevPage = computed(() => {
  return selectedPage.value !== 1
})

const renderedPages = computed(() => {
  return generatePages(selectedPage.value, props.maxPagesShown, totalPages.value)
})
// ---> Events ---- //
const emit = defineEmits([
  PAGINATION_EMITS.ON_CURRENT_PAGE_CHANGE,
  PAGINATION_EMITS.ON_PER_PAGE_CHANGE
])

const handlePageClick = (page: number) => {
  if (page !== selectedPage.value) {
    selectedPage.value = page
  }

  emit(PAGINATION_EMITS.ON_CURRENT_PAGE_CHANGE, page)
}

const handleNextPage = () => {
  if (selectedPage.value < totalPages.value) {
    selectedPage.value += 1
    emit(PAGINATION_EMITS.ON_CURRENT_PAGE_CHANGE, selectedPage.value)
  }
}

const handleBreakpoint = () => {
  selectedPage.value = selectedPage.value + Math.ceil(props.maxPagesShown / 2)
  emit(PAGINATION_EMITS.ON_CURRENT_PAGE_CHANGE, selectedPage.value)
}

const handlePrevPage = () => {
  if (selectedPage.value < totalPages.value && selectedPage.value > 1) {
    selectedPage.value -= 1
    emit(PAGINATION_EMITS.ON_CURRENT_PAGE_CHANGE, selectedPage.value)
  }
}

watch(selectedPerPage, (newValue: number) => {
  emit(PAGINATION_EMITS.ON_PER_PAGE_CHANGE, newValue)
})
</script>

<template>
  <div class="flex items-center justify-between w-full">
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        type="button"
        :disabled="!hasPrevPage && selectedPage === totalPages"
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
          <Listbox v-slot="{ open }" v-model="selectedPerPage">
            <div
              class="relative mt-1 w-[4.25rem] border border-solid border-apex-grey-2 rounded-lg"
            >
              <ListboxButton
                class="relative w-full cursor-pointer rounded-lg bg-white py-2 px-3 text-left focus:outline-none sm:text-sm"
              >
                <span class="block truncate text-apex-black font-bold font-apex">{{
                  selectedPerPage
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
                    v-for="page in props.perPages"
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
                      <span :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">{{
                        page
                      }}</span>
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
            :disabled="!hasPrevPage"
            @click="handlePrevPage"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 focus:z-20 focus:outline-offset-0 w-10 h-10 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="sr-only">Previous</span>
            <IconChevronLeft class="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            v-for="page in renderedPages.slice(0, 4)"
            type="button"
            aria-current="page"
            class="relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold hover:bg-apex-light-green hover:text-apex-green w-10 h-10 rounded-xl"
            :class="{ 'bg-apex-light-green text-apex-green ': page === selectedPage }"
            @click="handlePageClick(page)"
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
                renderedPages[renderedPages.length - 1] === selectedPage
            }"
            @click="handlePageClick(renderedPages[renderedPages.length - 1])"
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
</template>
