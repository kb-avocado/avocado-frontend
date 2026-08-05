<template>
  <main class="flex min-h-full flex-col bg-white px-4 pb-5 pt-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">누구에게 송금할까요?</h1>
      <p class="mt-2 text-sm text-gray-500">은행과 계좌번호를 입력해주세요.</p>
    </div>

    <form class="mt-8 flex flex-1 flex-col" novalidate @submit.prevent="handleSearch">
      <div class="space-y-6">
        <BankSelect
          v-model="form.bankCode"
          :banks="banks"
          :error="errors.bankCode"
          :disabled="isSearching"
          @update:model-value="clearFieldError('bankCode')"
          @blur="validateBank"
        />

        <AccountNumberInput
          v-model="form.accountNumber"
          :error="errors.accountNumber"
          :disabled="isSearching"
          @update:model-value="clearFieldError('accountNumber')"
          @blur="validateAccountNumber"
        />

        <p
          v-if="searchError"
          role="alert"
          aria-live="polite"
          class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {{ searchError }}
        </p>
      </div>

      <BaseButton
        class="mt-auto h-12 w-full rounded-xl"
        :disabled="!canSubmit || isSearching"
        @click="handleSearch"
      >
        <span
          v-if="isSearching"
          class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden="true"
        />
        {{ isSearching ? '확인 중...' : '다음' }}
      </BaseButton>
    </form>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import AccountNumberInput from '@/components/transfer/AccountNumberInput.vue'
import BankSelect from '@/components/transfer/BankSelect.vue'
import { getTransferRecipient } from '@/api/transfer'
import { TRANSFER_RECIPIENT_SEARCH_TYPE, TRANSFER_RECIPIENT_TYPE } from '@/constants'
import { useTransferStore } from '@/stores/transfer'

const MIN_ACCOUNT_NUMBER_LENGTH = 8

const router = useRouter()
const transferStore = useTransferStore()

const banks = [
  { code: 'KB', name: 'KB국민은행' },
  { code: 'SHINHAN', name: '신한은행' },
  { code: 'HANA', name: '하나은행' },
  { code: 'WOORI', name: '우리은행' },
  { code: 'NH', name: 'NH농협은행' },
  { code: 'KAKAO', name: '카카오뱅크' },
  { code: 'TOSS', name: '토스뱅크' }
]

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
    form.bankCode !== '' &&
    form.accountNumber.length >= MIN_ACCOUNT_NUMBER_LENGTH &&
    !errors.bankCode &&
    !errors.accountNumber
)

function clearFieldError(field) {
  errors[field] = ''
  searchError.value = ''
}

function validateAccountNumber() {
  if (!form.accountNumber) {
    errors.accountNumber = '계좌번호를 입력해주세요.'
    return false
  }

  if (form.accountNumber.length < MIN_ACCOUNT_NUMBER_LENGTH) {
    errors.accountNumber = '계좌번호를 8자리 이상 입력해주세요.'
    return false
  }

  errors.accountNumber = ''
  return true
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

function unwrapResponse(response) {
  const body = response?.data
  return body?.data ?? body
}

function normalizeRecipient(data) {
  if (!data || typeof data !== 'object') return null

  const name = data.recipientName ?? data.name
  const accountNumber = data.accountNumber ?? form.accountNumber
  const selectedBank = banks.find((bank) => bank.code === form.bankCode)

  if (!name || !accountNumber) return null

  return {
    recipientId: data.recipientId ?? data.accountId ?? data.walletId ?? data.id ?? null,
    recipientType: data.recipientType ?? TRANSFER_RECIPIENT_TYPE.ACCOUNT,
    name,
    bankCode: data.bankCode ?? form.bankCode,
    bankName: data.bankName ?? selectedBank?.name ?? '',
    accountNumber,
    maskedAccountNumber: data.maskedAccountNumber ?? accountNumber,
    userCode: data.userCode ?? ''
  }
}

function getSearchErrorMessage(error) {
  const status = error?.response?.status

  if (status === 404) return '일치하는 송금 대상을 찾을 수 없어요.'
  if (status >= 500) return '서버에 문제가 발생했어요. 잠시 후 다시 시도해주세요.'

  return error?.response?.data?.message ?? '송금 대상을 확인하지 못했어요. 다시 시도해주세요.'
}

async function handleSearch() {
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

    const recipient = normalizeRecipient(unwrapResponse(response))

    if (!recipient) {
      searchError.value = '송금 대상 정보를 확인할 수 없어요.'
      return
    }

    transferStore.setRecipient(recipient)
    await router.push({ name: 'transfer-amount' })
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
</script>
