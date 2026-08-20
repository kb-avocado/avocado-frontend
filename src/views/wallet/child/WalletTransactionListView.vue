<template>
  <div class="min-h-full bg-gray-50 px-4 pb-8 pt-5">
    <div class="mb-4 px-1">
      <div class="flex items-center justify-between gap-2">
        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="이전 달"
          :disabled="isMonthLoading"
          @click="goToPreviousMonth"
        >
          <ChevronLeft :size="20" />
        </button>

        <h2 class="text-lg font-bold text-gray-900">{{ monthTitle }}의 지갑 기록</h2>

        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="다음 달"
          :disabled="!canGoNextMonth || isMonthLoading"
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

      <div v-if="isLoading" class="space-y-3" role="status" aria-live="polite">
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

      <div v-else-if="isMonthLoading" class="space-y-3" role="status" aria-live="polite">
        <div v-for="index in 6" :key="index" class="flex animate-pulse items-center gap-3 py-2">
          <span class="h-10 w-10 shrink-0 rounded-full bg-gray-100" />
          <span class="min-w-0 flex-1">
            <span class="block h-3.5 w-28 rounded bg-gray-100" />
            <span class="mt-2 block h-3 w-36 rounded bg-gray-100" />
          </span>
          <span class="h-4 w-20 rounded bg-gray-100" />
        </div>
        <span class="sr-only">{{ monthTitle }} 지갑 기록을 불러오는 중입니다.</span>
      </div>

      <div v-else-if="errorMessage" class="px-4 py-12 text-center" role="alert">
        <CircleAlert :size="42" class="mx-auto text-red-400" aria-hidden="true" />
        <p class="mt-4 text-sm text-gray-600">{{ errorMessage }}</p>
        <BaseButton class="mt-5" size="sm" @click="loadTransactions({ reset: true })">
          다시 불러오기
        </BaseButton>
      </div>

      <div v-else-if="!transactions.length" class="px-4 py-12 text-center" role="status">
        <ReceiptText :size="42" class="mx-auto text-gray-300" aria-hidden="true" />
        <p class="mt-4 text-sm text-gray-500">표시할 거래 내역이 없어요.</p>
      </div>

      <div v-else-if="!filteredTransactions.length" class="px-4 py-12 text-center" role="status">
        <ReceiptText :size="42" class="mx-auto text-gray-300" aria-hidden="true" />
        <p class="mt-4 text-sm text-gray-500">선택한 달에는 기록이 없어요.</p>
        <BaseButton
          v-if="hasMore"
          class="mt-5"
          size="sm"
          variant="outline"
          :disabled="isLoadingMore"
          @click="loadTransactions()"
        >
          {{ isLoadingMore ? '불러오는 중' : '더 불러오기' }}
        </BaseButton>
      </div>

      <template v-else>
        <ul class="divide-y divide-gray-100">
          <li v-for="transaction in filteredTransactions" :key="transaction.id" class="py-1">
            <WalletTransactionItem :transaction="transaction" date-style="full" />
          </li>
        </ul>

        <div
          v-if="loadMoreError"
          class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center"
          role="alert"
        >
          <p class="text-xs text-red-600">{{ loadMoreError }}</p>
        </div>

        <BaseButton
          v-if="hasMore"
          class="mt-5 w-full"
          variant="outline"
          :disabled="isLoadingMore"
          @click="loadTransactions()"
        >
          <LoaderCircle
            v-if="isLoadingMore"
            :size="17"
            class="mr-1 animate-spin"
            aria-hidden="true"
          />
          {{ isLoadingMore ? '불러오는 중' : loadMoreError ? '다시 시도' : '거래 내역 더 보기' }}
        </BaseButton>

        <p v-else class="mt-5 text-center text-xs text-gray-400">모든 거래 내역을 확인했어요.</p>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronLeft, ChevronRight, CircleAlert, LoaderCircle, ReceiptText } from 'lucide-vue-next'
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
  { value: 'CHARGE', label: '충전' },
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
const nextPage = ref(0)
const totalPages = ref(null)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const isMonthLoading = ref(false)
const errorMessage = ref('')
const loadMoreError = ref('')
const selectedMonth = ref(CURRENT_MONTH_KEY)
const selectedType = ref('ALL')
let requestSequence = 0
let requestController = null

const hasMore = computed(() => totalPages.value === null || nextPage.value < totalPages.value)
const canGoNextMonth = computed(() => selectedMonth.value < CURRENT_MONTH_KEY)

const monthTitle = computed(() => {
  const [year, month] = selectedMonth.value.split('-')
  return year === String(new Date().getFullYear())
    ? `${Number(month)}월`
    : `${year}년 ${Number(month)}월`
})

function getTransactionMonthKey(transaction) {
  const date = new Date(transaction.createdAt)
  if (Number.isNaN(date.getTime())) return ''
  return getMonthKey(date)
}

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

async function ensureMonthLoaded(monthKey) {
  isMonthLoading.value = true
  try {
    while (hasMore.value) {
      const oldestLoaded = transactions.value.length
        ? getTransactionMonthKey(transactions.value[transactions.value.length - 1])
        : ''
      if (oldestLoaded && oldestLoaded <= monthKey) break
      await loadTransactions()
    }
  } finally {
    isMonthLoading.value = false
  }
}

function goToPreviousMonth() {
  if (isMonthLoading.value) return
  selectedMonth.value = shiftMonthKey(selectedMonth.value, -1)
  ensureMonthLoaded(selectedMonth.value)
}

function goToNextMonth() {
  if (isMonthLoading.value || !canGoNextMonth.value) return
  selectedMonth.value = shiftMonthKey(selectedMonth.value, 1)
}

function getErrorMessage(error) {
  return error?.response?.status >= 500
    ? '서버 문제로 거래 내역을 불러오지 못했어요.'
    : '전체 거래 내역을 불러오지 못했어요.'
}

async function loadTransactions({ reset = false } = {}) {
  if (isLoading.value || isLoadingMore.value) return

  const currentSequence = ++requestSequence
  requestController?.abort()
  requestController = new AbortController()

  if (reset) {
    transactions.value = []
    nextPage.value = 0
    totalPages.value = null
    errorMessage.value = ''
    isLoading.value = true
  } else {
    loadMoreError.value = ''
    isLoadingMore.value = true
  }

  try {
    const loadedTransactions = []
    let page = nextPage.value
    let isLastPage = false

    do {
      const response = await getWalletTransactions({
        page,
        size: PAGE_SIZE,
        signal: requestController.signal
      })
      const pageData = response.data?.data
      const items = pageData?.items

      if (!Array.isArray(items)) {
        throw new Error('전체 거래 내역 응답 형식이 올바르지 않습니다.')
      }

      if (currentSequence !== requestSequence) return

      loadedTransactions.push(
        ...items
          .map((item) => normalizeWalletTransaction(item))
          .filter((item) => isDisplayableWalletTransaction(item))
      )

      const serverTotalPages = Number(pageData.total_pages)
      const hasServerTotalPages = Number.isFinite(serverTotalPages)
      totalPages.value = hasServerTotalPages ? serverTotalPages : null
      page += 1
      isLastPage = totalPages.value === null ? items.length < PAGE_SIZE : page >= totalPages.value
      if (!hasServerTotalPages && isLastPage) totalPages.value = page
    } while (!loadedTransactions.length && !isLastPage)

    if (currentSequence !== requestSequence) return

    const existingIds = new Set(transactions.value.map((transaction) => transaction.id))
    const uniqueTransactions = loadedTransactions.filter(
      (transaction) => !existingIds.has(transaction.id)
    )

    transactions.value = reset ? uniqueTransactions : [...transactions.value, ...uniqueTransactions]
    nextPage.value = page
  } catch (requestError) {
    if (currentSequence !== requestSequence || requestError?.code === 'ERR_CANCELED') return

    console.error('전체 거래 내역 조회 실패:', requestError)
    if (reset) {
      errorMessage.value = getErrorMessage(requestError)
    } else {
      loadMoreError.value = getErrorMessage(requestError)
    }
  } finally {
    if (currentSequence === requestSequence) {
      isLoading.value = false
      isLoadingMore.value = false
      requestController = null
    }
  }
}

onMounted(() => loadTransactions({ reset: true }))

onBeforeUnmount(() => {
  requestSequence += 1
  requestController?.abort()
})
</script>
