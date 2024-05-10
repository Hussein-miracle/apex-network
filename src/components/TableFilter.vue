<script setup lang="ts">
import { PAYMENT_STATUSES, USER_STATUSES, TABLE_FILTERS_EMITS } from '@/shared/constants'
import { useToggle } from '@/shared/hooks'
import {
  addThousandSeparator,
  handleDisableLettersAndMultipleDecimal,
  removeItemFromString
} from '@/shared/utils'
import type { PaymentStatusItem, StatusItem, UserStatusItem } from '@/shared/types'
import {
  Listbox,
  ListboxLabel,
  ListboxButton,
  ListboxOptions,
  ListboxOption
} from '@headlessui/vue'
import IconFilterVue from '@/components/icons/IconFilter.vue'
import IconChevronUpDown from '@/components/icons/IconChevronUpDown.vue'
import { ref, type PropType, computed } from 'vue'

const { value: showFilters, toggle: toggleFilters } = useToggle()
const props = defineProps({
  selectedPaymentStatus: {
    type: String as PropType<StatusItem['value']>,
    default: PAYMENT_STATUSES[0].value
  },
  selectedUserStatus: {
    type: String as PropType<StatusItem['value']>,
    default: USER_STATUSES[0].value
  },
  amountInput: {
    type: String,
    default: ''
  },
  searchInput: {
    type: String,
    default: ''
  }
})

const emits = defineEmits([
  `${TABLE_FILTERS_EMITS.PAYMENT_STATUS_EMIT}`,
  `${TABLE_FILTERS_EMITS.USER_STATUS_EMIT}`,
  `${TABLE_FILTERS_EMITS.AMOUNT_INPUT_EMIT}`,
  `${TABLE_FILTERS_EMITS.SEARCH_INPUT_EMIT}`
])

const selectedPaymentStatusProxy = computed({
  get: () => props.selectedPaymentStatus,
  set: (newValue: string) => emits(`${TABLE_FILTERS_EMITS.PAYMENT_STATUS_EMIT}`, newValue)
})
const selectedUserStatusProxy = computed({
  get: () => props.selectedUserStatus,
  set: (newValue: string) => emits(`${TABLE_FILTERS_EMITS.USER_STATUS_EMIT}`, newValue)
})

const amountInputProxy = computed({
  get: () => props.amountInput,
  set: (newValue: string) => emits(`${TABLE_FILTERS_EMITS.AMOUNT_INPUT_EMIT}`, newValue)
})

const searchInputProxy = computed({
  get: () => props.searchInput,
  set: (newValue: string) => emits(`${TABLE_FILTERS_EMITS.SEARCH_INPUT_EMIT}`, newValue)
})

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

  amountInputProxy.value = parts
}
</script>

<template>
  <section class="px-4 flex flex-col items-center gap-2 ">
    <main class="flex items-center justify-end pt-6 pb-4 w-full">
      <button
        class="bg-apex-light-white rounded-xl p-4 border border-apex-grey-2 flex items-center gap-2 justify-between"
        @click="toggleFilters"
      >
        <span class="text-apex-green w-6 h-6">
          <IconFilterVue />
        </span>
        <span class="text-apex-green text-base font-medium">Filter</span>
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
            v-model="searchInputProxy"
            placeholder="name"
            class="w-full border-transparent bg-apex-light-white rounded-md p-4 text-base text-apex-content-header placeholder:text-[#A0AEC0] outline-none focus:outline-none focus:border-apex-green focus:ring-1 focus:ring-apex-green"
          />
          <!-- v-model="searchInput" -->
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
            :value="amountInputProxy"
            @keydown="handleDisableLettersAndMultipleDecimal"
            @input="handleAmountChange"
            class="w-full border border-transparent bg-apex-light-white rounded-md p-4 text-base text-apex-content-header placeholder:text-[#A0AEC0] outline-none focus:outline-none focus:border-apex-green focus:ring-1 focus:ring-apex-green"
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
          v-slot="{ open }"
          v-model="selectedUserStatusProxy"
          class="w-full flex justify-between flex-col items-start gap-2"
        >
          <ListboxLabel class="block leading-6 text-apex-black font-bold text-base">
            User's&nbsp;Status</ListboxLabel
          >
          <!-- v-model="selectedUserStatus" -->
          <div class="relative w-full">
            <ListboxButton
              class="relative cursor-pointer py-4 pl-4 pr-10 text-left shadow-sm sm:text-sm sm:leading-6 w-full border border-transparent bg-apex-light-white rounded-md p-4 text-base text-apex-content-header placeholder:text-[#A0AEC0] outline-none focus:outline-none focus:border-apex-green focus:ring-1 focus:ring-apex-green"
            >
              <span class="block truncate text-base font-medium text-apex-content-header capitalize"
                >{{ selectedUserStatus }}&nbsp;</span
              >

              <span
                class="pointer-events-none absolute inset-y-0 flex items-center origin-center right-2 transition-transform duration-150 ease-out rotate-0"
                :class="{ 'rotate-180': open, 'rotate-0': !open }"
              >
                <IconChevronUpDown class="h-5 w-5 text-apex-filter-icon" aria-hidden="true" />
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
          v-model="selectedPaymentStatusProxy"
          v-slot="{ open }"
          class="w-full flex justify-between flex-col items-start gap-2"
        >
          <ListboxLabel class="block leading-6 text-apex-black font-bold text-base"
            >Payment&nbsp;Status</ListboxLabel
          >
          <div class="relative w-full">
            <ListboxButton
              class="relative cursor-pointer py-4 pl-4 pr-10 text-left shadow-sm sm:text-sm sm:leading-6 w-full border border-transparent bg-apex-light-white rounded-md p-4 text-base text-apex-content-header placeholder:text-[#A0AEC0] outline-none focus:outline-none focus:border-apex-green focus:ring-1 focus:ring-apex-green"
            >
              <span class="block truncate text-base font-medium text-apex-content-header capitalize"
                >{{ selectedPaymentStatusProxy }}&nbsp;</span
              >

              <span
                class="pointer-events-none absolute inset-y-0 flex items-center origin-center right-2 transition-transform duration-150 ease-out rotate-0"
                :class="{ 'rotate-180': open, 'rotate-0': !open }"
              >
                <IconChevronUpDown class="h-5 w-5 text-apex-filter-icon" aria-hidden="true" />
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
</template>
