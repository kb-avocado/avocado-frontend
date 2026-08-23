<template>
  <div class="min-h-full bg-gray-50 px-4 pb-8 pt-5">
    <div class="mb-4 px-1">
      <div class="flex items-center justify-between gap-2">
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="이전 달"
          :disabled="!canGoPreviousMonth"
          @click="goToPreviousMonth"
        >
          <ChevronLeft :size="20" />
        </button>

        <div class="flex flex-col items-center leading-tight">
          <span class="text-xs font-medium text-gray-400">{{ selectedYearLabel }}</span>
          <h2 class="text-lg font-bold text-gray-900">{{ selectedMonthLabel }}의 지갑 기록</h2>
        </div>

        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="다음 달"
          :disabled="!canGoNextMonth"
          @click="goToNextMonth"
        >
          <ChevronRight :size="20" />
        </button>
      </div>

      <div class="mt-3 flex gap-1.5 overflow-x-auto" role="tablist" aria-label="소비 내역 필터">
        <button
          v-for="filter in typeFilterOptions"
          :key="filter.value"
          type="button"
          role="tab"
          class="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition"
          :class="
            selectedType === filter.value
              ? 'bg-avocado-600 text-white'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          "
          :aria-selected="selectedType === filter.value"
          @click="selectedType = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <section
      class="rounded-2xl bg-white p-4 shadow-[0_4px_18px_rgba(0,0,0,0.06)]"
      aria-labelledby="wallet-transaction-list-title"
    >
      <h3 id="wallet-transaction-list-title" class="sr-only">지갑 거래 목록</h3>

      <Transition name="fade" mode="out-in">
        <div v-if="isLoading" key="loading" class="space-y-3" role="status" aria-live="polite">
          <div v-for="index in 6" :key="index" class="flex animate-pulse items-center gap-3 py-2">
            <span class="h-10 w-10 shrink-0 rounded-full bg-gray-100" />
            <span class="min-w-0 flex-1">
              <span class="block h-3.5 w-28 rounded bg-gray-100" />
              <span class="mt-2 block h-3 w-36 rounded bg-gray-100" />
            </span>
            <span class="h-4 w-20 rounded bg-gray-100" />
          </div>
          <span class="sr-only">전체 거래 내역을 불러오는 중입니다.</span>
        </div>

        <div v-else-if="errorMessage" key="error" class="px-4 py-12 text-center" role="alert">
          <CircleAlert :size="42" class="mx-auto text-red-400" aria-hidden="true" />
          <p class="mt-4 text-sm text-gray-600">{{ errorMessage }}</p>
          <BaseButton class="mt-5" size="sm" @click="loadTransactions()"> 다시 불러오기 </BaseButton>
        </div>

        <div
          v-else-if="!transactions.length"
          key="empty-all"
          class="px-4 py-12 text-center"
          role="status"
        >
          <ReceiptText :size="42" class="mx-auto text-gray-300" aria-hidden="true" />
          <p class="mt-4 text-sm text-gray-500">표시할 거래 내역이 없어요.</p>
        </div>

        <div
          v-else-if="!filteredTransactions.length"
          key="empty-filtered"
          class="px-4 py-12 text-center"
          role="status"
        >
          <ReceiptText :size="42" class="mx-auto text-gray-300" aria-hidden="true" />
          <p class="mt-4 text-sm text-gray-500">선택한 달에는 기록이 없어요.</p>
        </div>

        <ul v-else key="list" class="divide-y divide-gray-100">
          <li v-for="transaction in filteredTransactions" :key="transaction.id">
            <WalletTransactionItem :transaction="transaction" date-style="full" />
          </li>
        </ul>
      </Transition>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronLeft, ChevronRight, CircleAlert, ReceiptText } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import WalletTransactionItem from '@/components/wallet/WalletTransactionItem.vue'
import { getWalletTransactions } from '@/api/wallet'
import {
  WALLET_TRANSACTION_TYPE,
  isDisplayableWalletTransaction,
  normalizeWalletTransaction
} from '@/utils/walletTransaction'

const PAGE_SIZE = 20

const TYPE_FILTER_GROUPS = {
  PAYMENT: [WALLET_TRANSACTION_TYPE.PAYMENT, WALLET_TRANSACTION_TYPE.PAYMENT_CANCEL],
  CHARGE: [WALLET_TRANSACTION_TYPE.CHARGE, WALLET_TRANSACTION_TYPE.CHARGE_CANCEL],
  TRANSFER: [
    WALLET_TRANSACTION_TYPE.TRANSFER_OUT,
    WALLET_TRANSACTION_TYPE.TRANSFER_IN,
    WALLET_TRANSACTION_TYPE.TRANSFER_CANCEL_OUT,
    WALLET_TRANSACTION_TYPE.TRANSFER_CANCEL_IN
  ],
  PIGGY: [WALLET_TRANSACTION_TYPE.PIGGY_BANK_DEPOSIT, WALLET_TRANSACTION_TYPE.PIGGY_BANK_WITHDRAWAL]
}

const typeFilterOptions = [
  { value: 'ALL', label: '전체' },
  { value: 'PAYMENT', label: '결제' },
  { value: 'CHARGE', label: '용돈' },
  { value: 'TRANSFER', label: '송금' },
  { value: 'PIGGY', label: '저금통' }
]

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function shiftMonthKey(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number)
  return getMonthKey(new Date(year, month - 1 + delta, 1))
}

const CURRENT_MONTH_KEY = getMonthKey(new Date())

const transactions = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const selectedMonth = ref(CURRENT_MONTH_KEY)
const selectedType = ref('ALL')
let requestSequence = 0
let requestController = null

const canGoNextMonth = computed(() => selectedMonth.value < CURRENT_MONTH_KEY)

const selectedYearLabel = computed(() => `${selectedMonth.value.split('-')[0]}년`)
const selectedMonthLabel = computed(() => `${Number(selectedMonth.value.split('-')[1])}월`)

function getTransactionMonthKey(transaction) {
  const date = new Date(transaction.createdAt)
  if (Number.isNaN(date.getTime())) return ''
  return getMonthKey(date)
}

// 전체 내역을 이미 다 불러온 상태이므로, 실제로 내역이 존재하는 가장 오래된 달까지만 이동을 허용한다.
const canGoPreviousMonth = computed(() => {
  if (!transactions.value.length) return false

  const earliestLoadedMonth = getTransactionMonthKey(
    transactions.value[transactions.value.length - 1]
  )
  return !earliestLoadedMonth || selectedMonth.value > earliestLoadedMonth
})

const filteredTransactions = computed(() =>
  transactions.value.filter((transaction) => {
    if (getTransactionMonthKey(transaction) !== selectedMonth.value) return false

    if (
      selectedType.value !== 'ALL' &&
      !TYPE_FILTER_GROUPS[selectedType.value]?.includes(transaction.transactionType)
    ) {
      return false
    }

    return true
  })
)

function goToPreviousMonth() {
  if (!canGoPreviousMonth.value) return
  selectedMonth.value = shiftMonthKey(selectedMonth.value, -1)
}

function goToNextMonth() {
  if (!canGoNextMonth.value) return
  selectedMonth.value = shiftMonthKey(selectedMonth.value, 1)
}

function getErrorMessage(error) {
  return error?.response?.status >= 500
    ? '서버 문제로 거래 내역을 불러오지 못했어요.'
    : '전체 거래 내역을 불러오지 못했어요.'
}

// 더보기 버튼 없이 모든 페이지를 이어서 한 번에 불러온다.
async function loadTransactions() {
  if (isLoading.value) return

  const currentSequence = ++requestSequence
  requestController?.abort()
  requestController = new AbortController()

  const loadedTransactions = []
  isLoading.value = true
  errorMessage.value = ''

  try {
    let page = 0
    let isLastPage = false

    do {
      const response = await getWalletTransactions({
        page,
        size: PAGE_SIZE,
        signal: requestController.signal
      })
      const items = response.data?.data?.items

      if (!Array.isArray(items)) {
        throw new Error('전체 거래 내역 응답 형식이 올바르지 않습니다.')
      }

      if (currentSequence !== requestSequence) return

      loadedTransactions.push(
        ...items
          .map((item) => normalizeWalletTransaction(item))
          .filter((item) => isDisplayableWalletTransaction(item))
      )

      isLastPage = items.length < PAGE_SIZE
      page += 1
    } while (!isLastPage)

    if (currentSequence !== requestSequence) return

    transactions.value = loadedTransactions
  } catch (requestError) {
    if (currentSequence !== requestSequence || requestError?.code === 'ERR_CANCELED') return

    console.error('전체 거래 내역 조회 실패:', requestError)
    errorMessage.value = getErrorMessage(requestError)
  } finally {
    if (currentSequence === requestSequence) {
      isLoading.value = false
      requestController = null
    }
  }
}

onMounted(() => loadTransactions())

onBeforeUnmount(() => {
  requestSequence += 1
  requestController?.abort()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
