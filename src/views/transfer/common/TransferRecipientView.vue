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
import { computed, reactive, ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import AccountNumberInput from '@/components/transfer/AccountNumberInput.vue'
import BankSelect from '@/components/transfer/BankSelect.vue'

const MIN_ACCOUNT_NUMBER_LENGTH = 8

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

const canSubmit = computed(
  () =>
    form.bankCode !== '' &&
    form.accountNumber.length >= MIN_ACCOUNT_NUMBER_LENGTH &&
    !errors.bankCode &&
    !errors.accountNumber
)

function clearFieldError(field) {
  errors[field] = ''
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

async function handleSearch() {
  if (isSearching.value || !validateForm()) return

  isSearching.value = true

  try {
    // 다음 커밋에서 수취인 검색 API를 연결합니다.
    await Promise.resolve()
  } finally {
    isSearching.value = false
  }
}
</script>
