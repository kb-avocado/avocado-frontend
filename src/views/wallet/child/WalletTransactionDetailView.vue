<template>
  <div class="min-h-full bg-gray-50 px-4 pb-8 pt-5">
    <div
      v-if="isLoading"
      class="flex min-h-[420px] flex-col items-center justify-center text-center"
      role="status"
      aria-live="polite"
    >
      <LoaderCircle :size="44" class="animate-spin text-avocado-600" aria-hidden="true" />
      <p class="mt-4 text-sm text-gray-500">거래 상세를 불러오는 중이에요.</p>
    </div>

    <div
      v-else-if="errorMessage"
      class="flex min-h-[420px] flex-col items-center justify-center px-6 text-center"
      role="alert"
    >
      <CircleAlert :size="48" class="text-red-400" aria-hidden="true" />
      <h2 class="mt-5 text-lg font-bold text-gray-900">거래 상세를 확인할 수 없어요</h2>
      <p class="mt-2 text-sm leading-6 text-gray-500">{{ errorMessage }}</p>
      <BaseButton class="mt-6" @click="fetchTransactionDetail">다시 불러오기</BaseButton>
    </div>

    <template v-else-if="transaction">
      <section
        class="rounded-3xl bg-white px-5 py-7 text-center shadow-[0_4px_18px_rgba(0,0,0,0.06)]"
      >
        <span
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-avocado-100"
        >
          <ReceiptText :size="25" class="text-avocado-600" aria-hidden="true" />
        </span>
        <h2 class="mt-4 text-lg font-bold text-gray-900">{{ transactionTitle }}</h2>
        <p class="mt-2 text-2xl font-bold" :class="getWalletTransactionAmountClass(transaction)">
          {{ formatWalletTransactionAmount(transaction) }}
        </p>
      </section>

      <section class="mt-4 rounded-2xl bg-white px-5 py-2 shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
        <h2 class="sr-only">상세 거래 정보</h2>
        <dl class="divide-y divide-gray-100">
          <div
            v-for="row in detailRows"
            :key="row.label"
            class="flex items-start justify-between gap-5 py-4"
          >
            <dt class="shrink-0 text-sm text-gray-500">{{ row.label }}</dt>
            <dd class="min-w-0 break-all text-right text-sm font-medium text-gray-800">
              {{ row.value }}
            </dd>
          </div>
        </dl>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { CircleAlert, LoaderCircle, ReceiptText } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import { getWalletTransactionDetail } from '@/api/wallet'
import {
  WALLET_TRANSACTION_TYPE,
  formatWalletMoney,
  formatWalletTransactionAmount,
  formatWalletTransactionDate,
  getBankName,
  getMerchantCategoryLabel,
  getWalletTransactionAmountClass,
  getWalletTransactionTitle,
  getWalletTransactionTypeLabel,
  isFailedPayment,
  maskAccountNumber,
  normalizeWalletTransaction
} from '@/utils/walletTransaction'

const props = defineProps({
  transactionId: {
    type: [String, Number],
    required: true
  }
})

const transaction = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
let requestSequence = 0
let requestController = null

const transactionTitle = computed(() => getWalletTransactionTitle(transaction.value))
const detailRows = computed(() => {
  if (!transaction.value) return []

  const item = transaction.value
  const rows = [
    { label: '거래 유형', value: getWalletTransactionTypeLabel(item) },
    { label: '거래 일시', value: formatWalletTransactionDate(item.createdAt, 'full') }
  ]

  if (item.counterpartyName) {
    const isPayment = [
      WALLET_TRANSACTION_TYPE.PAYMENT,
      WALLET_TRANSACTION_TYPE.PAYMENT_CANCEL
    ].includes(item.transactionType)
    rows.push({ label: isPayment ? '가맹점' : '거래 상대', value: item.counterpartyName })
  }

  if (item.targetBankCode) {
    rows.push({ label: '은행', value: getBankName(item.targetBankCode) })
  }

  if (item.targetAccountNumber) {
    rows.push({ label: '계좌번호', value: maskAccountNumber(item.targetAccountNumber) })
  }

  if (item.merchantCategory) {
    rows.push({ label: '가맹점 업종', value: getMerchantCategoryLabel(item.merchantCategory) })
  }

  if (item.balanceBefore !== null) {
    rows.push({ label: '거래 전 잔액', value: formatWalletMoney(item.balanceBefore) })
  }

  if (item.balanceAfter !== null) {
    rows.push({ label: '거래 후 잔액', value: formatWalletMoney(item.balanceAfter) })
  }

  if (item.failureCode) {
    rows.push({ label: '실패 코드', value: item.failureCode })
  }

  return rows
})

function getErrorMessage(error) {
  if (error?.response?.status === 404) return '존재하지 않거나 확인할 수 없는 거래예요.'
  if (error?.response?.status >= 500) return '서버 문제로 거래 상세를 불러오지 못했어요.'
  return '거래 상세를 불러오지 못했어요.'
}

async function fetchTransactionDetail() {
  const transactionId = String(props.transactionId ?? '').trim()
  const currentSequence = ++requestSequence
  requestController?.abort()
  requestController = null

  if (!/^\d+$/.test(transactionId)) {
    transaction.value = null
    isLoading.value = false
    errorMessage.value = '올바르지 않은 거래 번호예요.'
    return
  }

  requestController = new AbortController()
  isLoading.value = true
  errorMessage.value = ''
  transaction.value = null

  try {
    const response = await getWalletTransactionDetail(transactionId, {
      signal: requestController.signal
    })
    const normalizedTransaction = normalizeWalletTransaction(response.data?.data)

    if (!normalizedTransaction) {
      throw new Error('거래 상세 응답 형식이 올바르지 않습니다.')
    }

    if (currentSequence !== requestSequence) return

    if (isFailedPayment(normalizedTransaction)) {
      errorMessage.value = '존재하지 않거나 확인할 수 없는 거래예요.'
      return
    }

    transaction.value = normalizedTransaction
  } catch (requestError) {
    if (currentSequence !== requestSequence || requestError?.code === 'ERR_CANCELED') return

    console.error('거래 상세 조회 실패:', requestError)
    errorMessage.value = getErrorMessage(requestError)
  } finally {
    if (currentSequence === requestSequence) {
      isLoading.value = false
      requestController = null
    }
  }
}

watch(() => props.transactionId, fetchTransactionDetail, { immediate: true })

onBeforeUnmount(() => {
  requestSequence += 1
  requestController?.abort()
})
</script>
