import { defineStore } from 'pinia'
import { getChildWallet } from '@/api/wallet'

function createInitialState() {
  return {
    wallet: null,
    loading: false,
    error: ''
  }
}

function normalizeWallet(data) {
  if (!data) {
    return null
  }

  return {
    walletId: data.wallet_id ?? data.walletId,
    childId: data.child_id ?? data.childId,
    walletNumber: data.wallet_number ?? data.walletNumber ?? '',
    balance: Number(data.balance ?? 0),
    status: data.status ?? '',
    createdAt: data.created_at ?? data.createdAt ?? '',
    updatedAt: data.updated_at ?? data.updatedAt ?? ''
  }
}

function getErrorMessage(error) {
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message ||
    '선불 지갑 정보를 불러오지 못했습니다.'
  )
}

export const useWalletStore = defineStore('wallet', {
  state: createInitialState,

  actions: {
    async fetchWallet(childId) {
      const normalizedChildId = String(childId ?? '').trim()

      if (!normalizedChildId) {
        this.error = '아이 정보를 확인해 주세요.'
        throw new Error(this.error)
      }

      this.loading = true
      this.error = ''

      try {
        const response = await getChildWallet(normalizedChildId)
        const data = response.data?.data ?? response.data

        this.wallet = normalizeWallet(data)

        return this.wallet
      } catch (error) {
        this.wallet = null
        this.error = getErrorMessage(error)

        throw error
      } finally {
        this.loading = false
      }
    },

    reset() {
      Object.assign(this, createInitialState())
    }
  }
})
