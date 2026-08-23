import { computed, reactive } from 'vue'
import { TRANSFER_BANKS } from '@/constants'

export function useTransferRecipientSearch(onSuccess) {
  const form = reactive({
    bankCode: '',
    accountNumber: '',
    recipientName: ''
  })

  const errors = reactive({
    bankCode: '',
    accountNumber: '',
    recipientName: ''
  })

  const canSubmit = computed(
    () =>
      form.bankCode !== '' &&
      form.accountNumber !== '' &&
      form.recipientName.trim() !== '' &&
      !errors.bankCode &&
      !errors.accountNumber &&
      !errors.recipientName
  )

  function clearFieldError(field) {
    errors[field] = ''
  }

  function validateAccountNumber() {
    const value = form.accountNumber.trim()
    if (!value) {
      errors.accountNumber = '계좌번호를 입력해주세요.'
    } else if (!/^\d+$/.test(value)) {
      errors.accountNumber = '계좌번호는 숫자만 입력해주세요.'
    } else {
      errors.accountNumber = ''
    }
    return !errors.accountNumber
  }

  function validateBank() {
    errors.bankCode = form.bankCode ? '' : '은행을 선택해주세요.'
    return !errors.bankCode
  }

  function validateRecipientName() {
    errors.recipientName = form.recipientName.trim() ? '' : '받는 사람 이름을 입력해주세요.'
    return !errors.recipientName
  }

  function validateForm() {
    const isBankValid = validateBank()
    const isAccountNumberValid = validateAccountNumber()
    const isNameValid = validateRecipientName()
    return isBankValid && isAccountNumberValid && isNameValid
  }

  function searchRecipient() {
    if (!validateForm()) return

    const selectedBank = TRANSFER_BANKS.find((bank) => bank.code === form.bankCode)

    onSuccess({
      name: form.recipientName.trim(),
      bankCode: form.bankCode,
      bankName: selectedBank?.name ?? '',
      accountNumber: form.accountNumber.trim()
    })
  }

  return {
    banks: TRANSFER_BANKS,
    form,
    errors,
    canSubmit,
    clearFieldError,
    validateAccountNumber,
    validateBank,
    validateRecipientName,
    searchRecipient
  }
}