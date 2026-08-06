import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { getTransferRecipient } from '@/api/transfer'
import { TRANSFER_BANKS, TRANSFER_RECIPIENT_SEARCH_TYPE } from '@/constants'
import { normalizeTransferRecipient, unwrapTransferResponse } from '@/utils/transfer'

export function useTransferRecipientSearch(onSuccess) {
  const form = reactive({
    bankCode: '',
    accountNumber: ''
  })

  const errors = reactive({
    bankCode: '',
    accountNumber: ''
  })

  const isSearching = ref(false)
  const searchError = ref('')
  let requestSequence = 0
  let requestController = null

  const canSubmit = computed(
    () =>
      form.bankCode !== '' && form.accountNumber !== '' && !errors.bankCode && !errors.accountNumber
  )

  function clearFieldError(field) {
    errors[field] = ''
    searchError.value = ''
  }

  function validateAccountNumber() {
    errors.accountNumber = form.accountNumber ? '' : '계좌번호를 입력해주세요.'
    return !errors.accountNumber
  }

  function validateBank() {
    errors.bankCode = form.bankCode ? '' : '은행을 선택해주세요.'
    return !errors.bankCode
  }

  function validateForm() {
    const isBankValid = validateBank()
    const isAccountNumberValid = validateAccountNumber()
    return isBankValid && isAccountNumberValid
  }

  function getSearchErrorMessage(error) {
    const status = error?.response?.status

    if (status === 404) return '일치하는 송금 대상을 찾을 수 없어요.'
    if (status >= 500) return '서버에 문제가 발생했어요. 잠시 후 다시 시도해주세요.'

    return error?.response?.data?.message ?? '송금 대상을 확인하지 못했어요. 다시 시도해주세요.'
  }

  async function searchRecipient() {
    if (isSearching.value || !validateForm()) return

    const currentSequence = ++requestSequence
    requestController?.abort()
    requestController = new AbortController()
    isSearching.value = true
    searchError.value = ''

    try {
      const response = await getTransferRecipient(
        TRANSFER_RECIPIENT_SEARCH_TYPE.ACCOUNT_NUMBER,
        form.accountNumber,
        { signal: requestController.signal }
      )

      if (currentSequence !== requestSequence) return

      const selectedBank = TRANSFER_BANKS.find((bank) => bank.code === form.bankCode)
      const recipient = normalizeTransferRecipient(unwrapTransferResponse(response), {
        bankCode: form.bankCode,
        bankName: selectedBank?.name,
        accountNumber: form.accountNumber
      })

      if (!recipient) {
        searchError.value = '송금 대상 정보를 확인할 수 없어요.'
        return
      }

      await onSuccess(recipient)
    } catch (error) {
      if (currentSequence !== requestSequence || error?.code === 'ERR_CANCELED') return
      searchError.value = getSearchErrorMessage(error)
    } finally {
      if (currentSequence === requestSequence) {
        isSearching.value = false
        requestController = null
      }
    }
  }

  onBeforeUnmount(() => {
    requestSequence += 1
    requestController?.abort()
  })

  return {
    banks: TRANSFER_BANKS,
    form,
    errors,
    canSubmit,
    isSearching,
    searchError,
    clearFieldError,
    validateAccountNumber,
    validateBank,
    searchRecipient
  }
}
