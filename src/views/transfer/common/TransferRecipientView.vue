<template>
  <NoChildConnected v-if="isParentWithNoChild" />

  <main v-else class="flex min-h-full flex-col bg-white px-4 pb-5 pt-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">누구에게 송금할까요?</h1>
      <p class="mt-2 text-sm text-gray-500">은행과 계좌번호를 입력해주세요.</p>
    </div>

    <form class="mt-8 flex flex-1 flex-col" novalidate @submit.prevent="searchRecipient">
      <div class="space-y-6">
        <BankSelect v-model="form.bankCode" :banks="banks" :error="errors.bankCode"
          @update:model-value="clearFieldError('bankCode')" @blur="validateBank" />

        <AccountNumberInput v-model="form.accountNumber" :error="errors.accountNumber"
          @update:model-value="clearFieldError('accountNumber')" @blur="validateAccountNumber" />

        <div>
          <label for="recipient-name" class="mb-2 block text-sm font-medium text-gray-700">
            받는 사람 이름
          </label>
          <input id="recipient-name" v-model="form.recipientName" type="text" placeholder="예: 홍길동"
            class="w-full rounded-xl border border-gray-200 p-3 text-sm text-gray-900 outline-none"
            @input="clearFieldError('recipientName')" @blur="validateRecipientName" />
          <p v-if="errors.recipientName" role="alert" class="mt-1 text-xs text-red-500">
            {{ errors.recipientName }}
          </p>
        </div>

        <RecentRecipientList :recipients="recentRecipients" :loading="isRecentLoading" :error="recentError"
          @retry="fetchRecentRecipients" @select="selectRecentRecipient" />
      </div>

      <BaseButton class="mt-auto h-12 w-full rounded-xl" :disabled="!canSubmit" @click="searchRecipient">
        다음
      </BaseButton>
    </form>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import NoChildConnected from '@/components/common/NoChildConnected.vue'
import AccountNumberInput from '@/components/transfer/AccountNumberInput.vue'
import BankSelect from '@/components/transfer/BankSelect.vue'
import RecentRecipientList from '@/components/transfer/RecentRecipientList.vue'
import { useRecentTransferRecipients } from '@/composables/transfer/useRecentTransferRecipients'
import { useTransferRecipientSearch } from '@/composables/transfer/useTransferRecipientSearch'
import { useTransferStore } from '@/stores/transfer'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const transferStore = useTransferStore()
const authStore = useAuthStore()

const isParentWithNoChild = computed(
  () => authStore.user?.type === 'PARENT' && (authStore.user?.child ?? []).length === 0
)

async function selectRecentRecipient(recipient) {
  transferStore.setRecipient(recipient)
  await router.push({ name: 'transfer-amount' })
}

const {
  banks,
  form,
  errors,
  canSubmit,
  clearFieldError,
  validateAccountNumber,
  validateBank,
  validateRecipientName,
  searchRecipient
} = useTransferRecipientSearch(selectRecentRecipient)

const { recentRecipients, isRecentLoading, recentError, fetchRecentRecipients } =
  useRecentTransferRecipients()
</script>