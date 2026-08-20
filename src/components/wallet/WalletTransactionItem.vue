<template>
  <RouterLink
    :to="{
      name: 'wallet-transaction-detail',
      params: { transactionId: transaction.transactionId }
    }"
    class="flex items-center gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-avocado-600"
  >
    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50">
      <component :is="transactionIcon" :size="17" class="text-avocado-600" aria-hidden="true" />
    </span>

    <span class="min-w-0 flex-1">
      <span class="block truncate text-sm font-medium text-gray-900">{{ title }}</span>
      <span class="mt-1 flex flex-wrap items-center gap-1.5">
        <span class="text-xs text-gray-400">
          {{ formatWalletTransactionDate(transaction.createdAt, dateStyle) }}
        </span>
      </span>
    </span>

    <span class="flex shrink-0 items-center gap-1">
      <strong class="text-sm" :class="getWalletTransactionAmountClass(transaction)">
        {{ amountText }}
      </strong>
      <ChevronRight :size="15" class="text-gray-300" aria-hidden="true" />
    </span>
    <span class="sr-only">상세 보기</span>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  PiggyBank,
  RotateCcw,
  Store,
  WalletCards
} from 'lucide-vue-next'
import {
  WALLET_TRANSACTION_TYPE,
  formatWalletTransactionAmount,
  formatWalletTransactionDate,
  getWalletTransactionAmountClass,
  getWalletTransactionTitle
} from '@/utils/walletTransaction'

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  },
  dateStyle: {
    type: String,
    default: 'relative',
    validator: (value) => ['relative', 'full'].includes(value)
  }
})

const title = computed(() => getWalletTransactionTitle(props.transaction))
const amountText = computed(() => formatWalletTransactionAmount(props.transaction))
const transactionIcon = computed(() => {
  switch (props.transaction.transactionType) {
    case WALLET_TRANSACTION_TYPE.PAYMENT:
      return Store
    case WALLET_TRANSACTION_TYPE.PAYMENT_CANCEL:
    case WALLET_TRANSACTION_TYPE.CHARGE_CANCEL:
    case WALLET_TRANSACTION_TYPE.TRANSFER_CANCEL_OUT:
    case WALLET_TRANSACTION_TYPE.TRANSFER_CANCEL_IN:
      return RotateCcw
    case WALLET_TRANSACTION_TYPE.PIGGY_BANK_DEPOSIT:
    case WALLET_TRANSACTION_TYPE.PIGGY_BANK_WITHDRAWAL:
      return PiggyBank
    case WALLET_TRANSACTION_TYPE.TRANSFER_OUT:
      return ArrowUpRight
    case WALLET_TRANSACTION_TYPE.TRANSFER_IN:
      return ArrowDownLeft
    default:
      return WalletCards
  }
})
</script>
