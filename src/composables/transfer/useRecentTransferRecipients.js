import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getRecentTransferRecipients } from '@/api/transfer'
import { normalizeRecentTransferRecipients, unwrapTransferResponse } from '@/utils/transfer'

export function useRecentTransferRecipients() {
  const recentRecipients = ref([])
  const isRecentLoading = ref(false)
  const recentError = ref('')
  let requestSequence = 0
  let requestController = null

  async function fetchRecentRecipients() {
    const currentSequence = ++requestSequence
    requestController?.abort()
    requestController = new AbortController()
    isRecentLoading.value = true
    recentError.value = ''

    try {
      const response = await getRecentTransferRecipients({ signal: requestController.signal })

      if (currentSequence !== requestSequence) return
      recentRecipients.value = normalizeRecentTransferRecipients(unwrapTransferResponse(response))
    } catch (error) {
      if (currentSequence !== requestSequence || error?.code === 'ERR_CANCELED') return

      recentRecipients.value = []
      recentError.value =
        error?.response?.status >= 500
          ? '서버 문제로 최근 내역을 불러오지 못했어요.'
          : '최근 송금 내역을 불러오지 못했어요.'
    } finally {
      if (currentSequence === requestSequence) {
        isRecentLoading.value = false
        requestController = null
      }
    }
  }

  onMounted(fetchRecentRecipients)

  onBeforeUnmount(() => {
    requestSequence += 1
    requestController?.abort()
  })

  return {
    recentRecipients,
    isRecentLoading,
    recentError,
    fetchRecentRecipients
  }
}
