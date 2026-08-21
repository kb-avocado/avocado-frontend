<template>
  <main class="flex min-h-full flex-col bg-white">
    <section v-if="result" class="flex flex-1 flex-col p-4">
      <div class="flex flex-1 flex-col items-center justify-center">
        <CircleCheck :size="52" class="text-avocado-600" />
        <h1 class="mt-5 text-xl font-bold text-gray-900">송금을 완료했어요</h1>

        <dl class="mt-8 w-full rounded-2xl bg-gray-50 p-5">
          <div class="flex items-center justify-between">
            <dt class="text-sm text-gray-500">받는 사람</dt>
            <dd class="text-sm font-medium text-gray-900">{{ result.recipientName }}</dd>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <dt class="text-sm text-gray-500">보낸 금액</dt>
            <dd class="text-lg font-bold text-gray-900">{{ formatCurrency(result.amount) }}</dd>
          </div>
        </dl>
      </div>

      <RouterLink
        :to="{ name: 'home' }"
        class="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-avocado-600 text-sm font-medium text-white"
      >
        홈으로 돌아가기
      </RouterLink>
    </section>

    <template v-else>
      <div class="flex-1 flex flex-col p-4">
        <div class="rounded-2xl bg-avocado-100 p-4 text-center space-y-1">
          <p class="text-sm text-muted">{{ recipient?.name }}</p>
          <p class="text-xs text-muted">
            {{ recipient?.bankName }} {{ recipient?.maskedAccountNumber ?? recipient?.accountNumber }}
          </p>
        </div>

        <div class="flex-1 flex flex-col items-center justify-center gap-2">
          <p class="text-sm font-medium text-avocado-900">얼마를 보낼까요?</p>
          <p class="text-3xl font-bold text-avocado-900">
            {{ formatCurrency(amount) }}
          </p>
          <p v-if="amountError" class="text-sm text-red-500 text-center">{{ amountError }}</p>
          <p v-if="sendError" class="text-sm text-red-500 text-center">{{ sendError }}</p>
        </div>

        <NumberKeypad mode="amount" :disabled="isSending" @input="appendDigit" @delete="deleteDigit" />
      </div>

      <div class="p-4">
        <BaseButton
          variant="primary"
          class="w-full"
          :disabled="!canSubmit || isSending"
          @click="submit"
        >
          {{ isSending ? '보내는 중...' : '보내기' }}
        </BaseButton>
      </div>
    </template>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { CircleCheck } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import NumberKeypad from '@/components/common/NumberKeypad.vue'

import { transferFromWallet } from '@/api/transfer'
import { useTransferStore } from '@/stores/transfer'
import { isValidAmount } from '@/utils/validators'
import { formatCurrency } from '@/utils/format'

const MAX_AMOUNT_LENGTH = 9 // 최대 9자리까지만 입력 허용
const MAX_AMOUNT = 1000000

const transferStore = useTransferStore()
const { recipient } = storeToRefs(transferStore)

const amountInput = ref('')
const sendError = ref('')
const isSending = ref(false)
const result = ref(null)

const amount = computed(() => Number(amountInput.value || 0))

const amountError = computed(() => {
  if (amount.value > MAX_AMOUNT) return `한 번에 ${formatCurrency(MAX_AMOUNT)}까지 보낼 수 있어요.`
  return ''
})

const canSubmit = computed(
  () => isValidAmount(amountInput.value) && !amountError.value && !isSending.value
)

/* 키패드 숫자 입력 */
function appendDigit(value) {
  sendError.value = ''
  if (amountInput.value.length >= MAX_AMOUNT_LENGTH) return
  if (amountInput.value === '' && value === '00') return // 처음부터 00 입력은 무시
  amountInput.value += value
}

/* 키패드 한 자리 지우기 */
function deleteDigit() {
  sendError.value = ''
  amountInput.value = amountInput.value.slice(0, -1)
}

function getSendErrorMessage(error) {
  const status = error?.response?.status

  if (status === 404) return '받는 계좌를 찾을 수 없어요.'
  if (status >= 500) return '서버에 문제가 발생했어요. 잠시 후 다시 시도해주세요.'

  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    '송금하지 못했어요. 다시 시도해주세요.'
  )
}

async function submit() {
  if (isSending.value || !canSubmit.value || !recipient.value) return

  isSending.value = true
  sendError.value = ''

  try {
    const response = await transferFromWallet({
      bankCode: recipient.value.bankCode,
      recipientNumber: recipient.value.accountNumber,
      recipientName: recipient.value.name,
      amount: amount.value
    })

    result.value = response.data?.data ?? response.data
    transferStore.reset()
  } catch (error) {
    sendError.value = getSendErrorMessage(error)
  } finally {
    isSending.value = false
  }
}
</script>