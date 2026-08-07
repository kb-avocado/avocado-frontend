<template>
  <div class="flex min-h-full flex-col px-4 py-5">
    <section class="rounded-3xl bg-avocado-100 p-5" aria-labelledby="wallet-balance-title">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p id="wallet-balance-title" class="text-sm font-medium text-gray-700">결제 가능 금액</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            {{ formatMoney(wallet.balance) }}<span class="ml-0.5 text-lg font-semibold">원</span>
          </p>
        </div>

        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
          <WalletCards :size="22" class="text-avocado-600" aria-hidden="true" />
        </span>
      </div>

      <div class="mt-5 border-t border-avocado-300 pt-4">
        <dl class="flex items-center justify-between gap-4 text-sm">
          <dt class="text-gray-600">선불 지갑 번호</dt>
          <dd class="font-medium text-gray-800">{{ wallet.walletNumber }}</dd>
        </dl>
      </div>
    </section>

    <section class="mt-8" aria-labelledby="payment-amount-title">
      <div class="px-1 text-center">
        <h2 id="payment-amount-title" class="text-lg font-bold text-gray-900">
          결제할 금액을 입력해 주세요
        </h2>
        <p class="mt-2 text-sm text-gray-500">보유한 지갑 잔액 안에서 결제할 수 있어요.</p>
      </div>

      <div
        class="mt-6 flex min-h-16 items-center justify-center border-b-2 px-2 pb-3"
        :class="hasInsufficientBalance ? 'border-red-400' : 'border-avocado-300'"
      >
        <span
          class="text-4xl font-bold tracking-tight"
          :class="paymentAmount ? 'text-gray-900' : 'text-gray-300'"
        >
          {{ formattedPaymentAmount }}
        </span>
        <span class="ml-1 text-xl font-semibold text-gray-500">원</span>
      </div>

      <p
        class="mt-2 min-h-5 px-2 text-center text-sm text-red-500"
        role="status"
        aria-live="polite"
      >
        {{ hasInsufficientBalance ? '지갑 잔액보다 큰 금액은 결제할 수 없어요.' : '' }}
      </p>
    </section>

    <NumberKeypad class="mt-3" mode="amount" @input="appendAmount" @delete="deleteAmount" />

    <BaseButton class="mt-6 h-12 w-full shrink-0 text-base" :disabled="!canPay">
      {{ paymentButtonText }}
    </BaseButton>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { WalletCards } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import NumberKeypad from '@/components/common/NumberKeypad.vue'

const MAX_PAYMENT_AMOUNT = 9999999

// TODO: 다음 커밋에서 선불 지갑 조회 결과로 교체합니다.
const wallet = {
  balance: 15200,
  walletNumber: '110-123-456789'
}

const paymentAmount = ref(0)

const formattedPaymentAmount = computed(() =>
  paymentAmount.value ? formatMoney(paymentAmount.value) : '0'
)

const hasInsufficientBalance = computed(() => paymentAmount.value > wallet.balance)
const canPay = computed(() => paymentAmount.value > 0 && !hasInsufficientBalance.value)
const paymentButtonText = computed(() =>
  paymentAmount.value ? `${formatMoney(paymentAmount.value)}원 결제하기` : '결제하기'
)

function formatMoney(value) {
  return Number(value ?? 0).toLocaleString('ko-KR')
}

function appendAmount(value) {
  const nextAmount = Number(`${paymentAmount.value || ''}${value}`)
  paymentAmount.value = Math.min(nextAmount, MAX_PAYMENT_AMOUNT)
}

function deleteAmount() {
  paymentAmount.value = Math.floor(paymentAmount.value / 10)
}
</script>
