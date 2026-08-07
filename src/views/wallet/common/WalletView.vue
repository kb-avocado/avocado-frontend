<template>
  <div
    v-if="['loading', 'error', 'empty'].includes(screenState)"
    class="flex min-h-full flex-col items-center justify-center px-6 py-12 text-center"
    :role="screenState === 'error' ? 'alert' : 'status'"
    aria-live="polite"
  >
    <LoaderCircle
      v-if="screenState === 'loading'"
      :size="48"
      class="animate-spin text-avocado-600"
      aria-hidden="true"
    />
    <CircleAlert
      v-else-if="screenState === 'error'"
      :size="52"
      class="text-red-500"
      aria-hidden="true"
    />
    <Wallet
      v-else-if="screenState === 'empty'"
      :size="52"
      class="text-gray-400"
      aria-hidden="true"
    />
    <h2 class="mt-5 text-xl font-bold text-gray-900">{{ stateTitle }}</h2>
    <p class="mt-2 max-w-xs whitespace-pre-line text-sm leading-6 text-gray-500">
      {{ stateDescription }}
    </p>

    <BaseButton
      v-if="screenState === 'error'"
      class="mt-6 h-11 min-w-32"
      :disabled="loading"
      @click="loadWallet"
    >
      다시 시도
    </BaseButton>
  </div>

  <div v-else class="flex min-h-full flex-col px-4 py-5">
    <div
      v-if="screenState === 'unavailable'"
      class="mb-4 flex gap-3 rounded-2xl bg-amber-50 p-4"
      role="alert"
    >
      <ShieldAlert :size="22" class="shrink-0 text-amber-500" aria-hidden="true" />
      <div>
        <p class="text-sm font-semibold text-gray-900">{{ stateTitle }}</p>
        <p class="mt-1 text-sm leading-5 text-gray-600">{{ stateDescription }}</p>
      </div>
    </div>

    <section class="rounded-3xl bg-avocado-100 p-5" aria-labelledby="wallet-balance-title">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p id="wallet-balance-title" class="text-sm font-medium text-gray-700">결제 가능 금액</p>
          <p class="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            {{ formatMoney(wallet?.balance) }}<span class="ml-0.5 text-lg font-semibold">원</span>
          </p>
        </div>

        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
          <WalletCards :size="22" class="text-avocado-600" aria-hidden="true" />
        </span>
      </div>

      <div class="mt-5 border-t border-avocado-300 pt-4">
        <dl class="flex items-center justify-between gap-4 text-sm">
          <dt class="text-gray-600">선불 지갑 번호</dt>
          <dd class="font-medium text-gray-800">{{ wallet?.walletNumber || '-' }}</dd>
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

    <NumberKeypad
      class="mt-3"
      mode="amount"
      :disabled="!isWalletAvailable"
      @input="appendAmount"
      @delete="deleteAmount"
    />

    <BaseButton class="mt-6 h-12 w-full shrink-0 text-base" :disabled="!canPay">
      {{ paymentButtonText }}
    </BaseButton>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { CircleAlert, LoaderCircle, ShieldAlert, Wallet, WalletCards } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import NumberKeypad from '@/components/common/NumberKeypad.vue'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'

const MAX_PAYMENT_AMOUNT = 9999999

const authStore = useAuthStore()
const walletStore = useWalletStore()
const { wallet, loading, error } = storeToRefs(walletStore)

const paymentAmount = ref(0)
const accessError = ref('')

const childId = computed(() => authStore.user?.childId ?? authStore.user?.child_id ?? '')

const formattedPaymentAmount = computed(() =>
  paymentAmount.value ? formatMoney(paymentAmount.value) : '0'
)

const walletBalance = computed(() => Number(wallet.value?.balance ?? 0))
const normalizedWalletStatus = computed(() => String(wallet.value?.status ?? '').toUpperCase())
const isWalletAvailable = computed(() => normalizedWalletStatus.value === 'ACTIVE')
const hasInsufficientBalance = computed(() => paymentAmount.value > walletBalance.value)
const canPay = computed(
  () => isWalletAvailable.value && paymentAmount.value > 0 && !hasInsufficientBalance.value
)
const paymentButtonText = computed(() =>
  paymentAmount.value ? `${formatMoney(paymentAmount.value)}원 결제하기` : '결제하기'
)

const screenState = computed(() => {
  if (loading.value) return 'loading'
  if (accessError.value || error.value) return 'error'
  if (!wallet.value) return 'empty'
  if (!isWalletAvailable.value) return 'unavailable'
  return 'ready'
})

const stateTitle = computed(
  () =>
    ({
      loading: '지갑 정보를 불러오고 있어요',
      error: '지갑 정보를 불러오지 못했어요',
      empty: '등록된 선불 지갑이 없어요',
      unavailable: '현재 결제할 수 없는 지갑이에요'
    })[screenState.value] ?? '지갑 상태를 확인해 주세요'
)

const stateDescription = computed(() => {
  if (screenState.value === 'error') {
    return accessError.value || error.value || '잠시 후 다시 시도해 주세요.'
  }

  if (screenState.value === 'empty') {
    return '선불 지갑을 등록한 뒤 결제 기능을 이용할 수 있어요.'
  }

  if (screenState.value === 'unavailable') {
    return getUnavailableDescription(normalizedWalletStatus.value)
  }

  return '잠시만 기다려 주세요.'
})

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

async function loadWallet() {
  accessError.value = ''

  if (!authStore.user || !childId.value) {
    walletStore.reset()
    accessError.value = '로그인 사용자 정보를 확인할 수 없어요. 다시 로그인해 주세요.'
    return
  }

  try {
    await walletStore.fetchWallet(childId.value)
  } catch {
    // 조회 실패 상태는 wallet store에서 관리하고 다음 커밋에서 UI로 표시합니다.
  }
}

function getUnavailableDescription(status) {
  const descriptions = {
    INACTIVE: '사용이 중지된 지갑이에요. 보호자에게 문의해 주세요.',
    SUSPENDED: '일시적으로 사용이 제한된 지갑이에요. 보호자에게 문의해 주세요.',
    BLOCKED: '사용이 차단된 지갑이에요. 보호자에게 문의해 주세요.',
    CLOSED: '해지된 지갑은 결제에 사용할 수 없어요.'
  }

  return descriptions[status] ?? '지갑 상태를 확인할 수 없어 결제를 진행할 수 없어요.'
}

onMounted(loadWallet)
</script>
