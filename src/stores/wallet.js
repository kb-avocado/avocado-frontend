import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getWalletBalance } from '@/api/wallet'

export const useWalletStore = defineStore('wallet', () => {
  const balance = ref(0)
  const isLoading = ref(false)

  async function fetchBalance() {
    isLoading.value = true
    try {
      const { data } = await getWalletBalance()
      balance.value = data.balance
    } finally {
      isLoading.value = false
    }
  }

  return { balance, isLoading, fetchBalance }
})
