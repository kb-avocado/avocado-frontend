import { computed, reactive } from 'vue'
import { TRANSFER_BANKS } from '@/constants'

export function useTransferRecipientSearch(onSuccess) {
  const form = reactive({
    bankCode: '',
    accountNumber: ''
  })

  const errors = reactive({
    bankCode: '',
    accountNumber: ''
  })

  /**
   * 은행 + 계좌번호가 모두 입력되고
   * 에러가 없을 때만 다음 버튼 활성화
   */
  const canSubmit = computed(
    () =>
      form.bankCode !== '' &&
      form.accountNumber.trim() !== '' &&
      !errors.bankCode &&
      !errors.accountNumber
  )

  /**
   * 필드 에러 초기화
   */
  function clearFieldError(field) {
    if (field in errors) {
      errors[field] = ''
    }
  }

  /**
   * 계좌번호 검증
   */
  function validateAccountNumber() {
    const value =
      form.accountNumber.trim()

    if (!value) {
      errors.accountNumber =
        '계좌번호를 입력해주세요.'
    } else if (!/^\d+$/.test(value)) {
      errors.accountNumber =
        '계좌번호는 숫자만 입력해주세요.'
    } else {
      errors.accountNumber = ''
    }

    return !errors.accountNumber
  }

  /**
   * 은행 검증
   */
  function validateBank() {
    errors.bankCode =
      form.bankCode
        ? ''
        : '은행을 선택해주세요.'

    return !errors.bankCode
  }

  /**
   * 전체 검증
   *
   * 받는 사람 이름은 더 이상 입력받지 않음
   */
  function validateForm() {
    const isBankValid =
      validateBank()

    const isAccountNumberValid =
      validateAccountNumber()

    return (
      isBankValid &&
      isAccountNumberValid
    )
  }

  /**
   * 받는 사람 검색
   *
   * 은행 + 계좌번호만 전달
   */
  function searchRecipient() {
    if (!validateForm()) {
      return
    }

    const selectedBank =
      TRANSFER_BANKS.find(
        (bank) =>
          bank.code ===
          form.bankCode
      )

    onSuccess({
      bankCode:
        form.bankCode,

      bankName:
        selectedBank?.name ?? '',

      accountNumber:
        form.accountNumber.trim()
    })
  }

  return {
    banks:
      TRANSFER_BANKS,

    form,

    errors,

    canSubmit,

    clearFieldError,

    validateAccountNumber,

    validateBank,

    searchRecipient
  }
}