<template>
  <main class="flex min-h-full flex-col bg-white px-4 pb-5 pt-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">누구에게 송금할까요?</h1>
      <p class="mt-2 text-sm text-gray-500">은행과 계좌번호를 입력해주세요.</p>
    </div>

    <form class="mt-8 flex flex-1 flex-col" novalidate @submit.prevent="searchRecipient">
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

        <RecentRecipientList
          :recipients="recentRecipients"
          :loading="isRecentLoading"
          :error="recentError"
          @retry="fetchRecentRecipients"
          @select="selectRecentRecipient"
        />
      </div>

      <BaseButton
        class="mt-auto h-12 w-full rounded-xl"
        :disabled="!canSubmit || isSearching"
        @click="searchRecipient"
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
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import AccountNumberInput from '@/components/transfer/AccountNumberInput.vue'
import BankSelect from '@/components/transfer/BankSelect.vue'
import RecentRecipientList from '@/components/transfer/RecentRecipientList.vue'
import { useRecentTransferRecipients } from '@/composables/transfer/useRecentTransferRecipients'
import { useTransferRecipientSearch } from '@/composables/transfer/useTransferRecipientSearch'
import { useTransferStore } from '@/stores/transfer'

const router = useRouter()
const transferStore = useTransferStore()

async function selectRecentRecipient(recipient) {
  transferStore.setRecipient(recipient)
  await router.push({ name: 'transfer-amount' })
}

const {
  banks,
  form,
  errors,
  canSubmit,
  isSearching,
  searchError,
  clearFieldError,
  validateAccountNumber,
  validateBank,
  searchRecipient
} = useTransferRecipientSearch(selectRecentRecipient)

const { recentRecipients, isRecentLoading, recentError, fetchRecentRecipients } =
  useRecentTransferRecipients()
</script>
