import { ref, computed } from 'vue'
import { defineStore } from 'pinia';


export const usePaymentsStore = defineStore('payments', () => {
  const selectedPayments = ref<Array<number>>([]);


  function setSelectedPayments(newPayments: number[]) {
    selectedPayments.value = [...newPayments]
  }


  return {
    selectedPayments,
    setSelectedPayments,
  }
})