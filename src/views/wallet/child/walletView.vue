<!-- 아이 결제 화면 -->
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
    />
    <CircleAlert v-else-if="screenState === 'error'" :size="52" class="text-red-500" />
    <WalletIcon v-else :size="52" class="text-gray-400" />
    <h2 class="mt-5 text-xl font-bold text-gray-900">{{ stateTitle }}</h2>
    <p class="mt-2 max-w-xs text-sm leading-6 text-gray-500">{{ stateDescription }}</p>
    <BaseButton v-if="screenState === 'error'" class="mt-6 h-11 min-w-32" @click="loadWallet">
      다시 시도
    </BaseButton>
  </div>

  <div v-else-if="showPin" class="flex h-full min-h-full flex-col px-6 pb-0 pt-4">
    <button
      type="button"
      class="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-gray-700"
      aria-label="비밀번호 입력 취소"
      @click="cancelPin"
    >
      <ArrowLeft :size="22" />
    </button>

    <div class="flex min-h-0 flex-1 flex-col items-center justify-center py-3 text-center">
      <img src="@/assets/images/ch3.png" alt="" class="h-[180px] w-[180px] object-contain" />
      <h2 class="mt-3 text-base font-bold text-gray-900">비밀번호 6자리를 입력해 주세요.</h2>
      <div class="mt-4 flex gap-3" aria-label="비밀번호 입력 상태" aria-live="polite">
        <span
          v-for="index in 6"
          :key="index"
          class="h-3 w-3 rounded-full"
          :class="index <= pin.length ? 'bg-avocado-600' : 'bg-gray-200'"
        />
      </div>
    </div>

    <NumberKeypad
      class="sticky bottom-0 z-0 mt-auto w-full shrink-0 bg-white pb-5 pt-3"
      mode="pin"
      @input="appendPin"
      @delete="deletePin"
      @cancel="cancelPin"
    />
  </div>

  <div v-else class="flex min-h-full flex-col px-4 pb-7 pt-4">
    <div
      v-if="screenState !== 'ready'"
      class="mb-4 flex gap-3 rounded-2xl bg-amber-50 p-4"
      role="alert"
    >
      <ShieldAlert :size="22" class="shrink-0 text-amber-500" />
      <div>
        <p class="text-sm font-semibold text-gray-900">{{ stateTitle }}</p>
        <p class="mt-1 text-sm leading-5 text-gray-600">{{ stateDescription }}</p>
      </div>
    </div>

    <section class="text-center" aria-labelledby="payment-guide-title">
      <h2 id="payment-guide-title" class="text-xl font-bold text-gray-900">스캔해서 결제하세요!</h2>
      <p class="mt-1 text-sm text-gray-500">가맹점 단말기에 바코드를 보여주세요.</p>
    </section>

    <button
      type="button"
      class="payment-card-ratio relative mt-5 block w-full rounded-3xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-avocado-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed"
      :disabled="screenState !== 'ready'"
      :aria-label="isFlipped ? '카드 앞면 보기' : '결제 바코드 보기, 비밀번호 인증 필요'"
      @click="handleCardClick"
    >
      <img
        v-if="!isFlipped"
        src="@/assets/images/card01.png"
        alt="아보카도 선불카드 앞면"
        class="h-full w-full rounded-3xl object-cover shadow-sm"
      />
      <div
        v-if="!isFlipped"
        class="absolute bottom-[9%] left-[6%] flex h-[27%] w-[31%] flex-col justify-center bg-transparent px-2"
      >
        <span class="text-xs text-gray-600">잔액 확인</span>
        <strong class="mt-1 whitespace-nowrap text-lg text-gray-900">
          {{ formatMoney(wallet?.balance) }}원
        </strong>
      </div>

      <article v-else class="h-full rounded-3xl bg-white p-5 shadow-[0_5px_20px_rgba(0,0,0,0.08)]">
        <div class="flex items-center justify-between text-xs text-gray-500">
          <span>결제 바코드</span>
          <span class="text-avocado-600">02:59</span>
        </div>
        <div class="barcode mt-4 h-16 w-full" role="img" aria-label="결제용 바코드 준비 중" />
        <p class="mt-2 text-center font-mono text-[11px] tracking-[0.18em] text-gray-500">
          QR 발급 API 연동 예정
        </p>
        <div class="mt-4 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
          <span class="text-sm text-gray-600">현재 잔액</span>
          <strong class="text-lg text-avocado-600">{{ formatMoney(wallet?.balance) }}원</strong>
        </div>
      </article>
    </button>

    <section class="mt-6 rounded-2xl bg-white p-4 shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-bold text-gray-900">최근 결제 내역</h2>
        <button type="button" class="text-xs text-gray-500" disabled>전체보기 ›</button>
      </div>

      <ul class="mt-3 space-y-4">
        <li v-for="item in recentPayments" :key="item.id" class="flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50">
            <component :is="item.icon" :size="16" class="text-avocado-600" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900">{{ item.merchant }}</p>
            <p class="mt-0.5 text-xs text-gray-400">{{ item.date }}</p>
          </div>
          <strong class="text-sm text-red-500">-{{ formatMoney(item.amount) }}원</strong>
        </li>
      </ul>
      <p class="mt-4 text-center text-[11px] text-gray-400">최근 내역 조회 API 연동 예정</p>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  ArrowLeft,
  CircleAlert,
  Gamepad2,
  LoaderCircle,
  ShieldAlert,
  ShoppingBasket,
  Store,
  Wallet as WalletIcon
} from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import NumberKeypad from '@/components/common/NumberKeypad.vue'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'

const USE_WALLET_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_WALLET_MOCK === 'true'
const MOCK_WALLET = {
  walletId: 1,
  childId: 1,
  walletNumber: '110-123-456789',
  balance: 15200,
  status: 'ACTIVE'
}

const authStore = useAuthStore()
const walletStore = useWalletStore()
const { wallet: fetchedWallet, loading, error } = storeToRefs(walletStore)
const accessError = ref('')
const isFlipped = ref(false)
const showPin = ref(false)
const pin = ref('')

const childId = computed(
  () =>
    authStore.user?.childId ??
    authStore.user?.child_id ??
    authStore.user?.userId ??
    authStore.user?.user_id ??
    authStore.user?.id ??
    ''
)
const wallet = computed(() => (USE_WALLET_MOCK ? MOCK_WALLET : fetchedWallet.value))
const normalizedStatus = computed(() => String(wallet.value?.status ?? '').toUpperCase())
const isAvailable = computed(() => normalizedStatus.value === 'ACTIVE')
const hasBalance = computed(() => Number(wallet.value?.balance ?? 0) > 0)

const screenState = computed(() => {
  if (!USE_WALLET_MOCK) {
    if (loading.value) return 'loading'
    if (accessError.value || error.value) return 'error'
    if (!wallet.value) return 'empty'
  }
  if (!isAvailable.value) return 'unavailable'
  if (!hasBalance.value) return 'zeroBalance'
  return 'ready'
})

const stateTitle = computed(
  () =>
    ({
      loading: '지갑 정보를 불러오고 있어요',
      error: '지갑 정보를 불러오지 못했어요',
      empty: '등록된 선불 지갑이 없어요',
      unavailable: '현재 결제할 수 없는 지갑이에요',
      zeroBalance: '결제 가능한 잔액이 없어요'
    })[screenState.value] ?? '지갑 상태를 확인해 주세요'
)

const stateDescription = computed(() => {
  if (screenState.value === 'error') return accessError.value || error.value
  if (screenState.value === 'empty') return '선불 지갑을 등록한 뒤 결제를 이용할 수 있어요.'
  if (screenState.value === 'zeroBalance') return '지갑에 돈을 받은 뒤 결제를 이용할 수 있어요.'
  if (screenState.value === 'unavailable') return '지갑 사용 상태를 확인한 뒤 다시 시도해 주세요.'
  return '잠시만 기다려 주세요.'
})

const recentPayments = [
  { id: 1, merchant: 'CU 편의점', date: '오늘 15:30', amount: 3500, icon: Store },
  { id: 2, merchant: 'Roblox', date: '어제 20:15', amount: 5000, icon: Gamepad2 },
  { id: 3, merchant: '파리바게뜨', date: '2월 14일', amount: 2400, icon: ShoppingBasket }
]

function formatMoney(value) {
  return Number(value ?? 0).toLocaleString('ko-KR')
}

function handleCardClick() {
  if (isFlipped.value) {
    isFlipped.value = false
    return
  }
  pin.value = ''
  showPin.value = true
}

function appendPin(value) {
  if (pin.value.length >= 6) return
  pin.value += value
  if (pin.value.length === 6) {
    showPin.value = false
    isFlipped.value = true
  }
}

function deletePin() {
  pin.value = pin.value.slice(0, -1)
}

function cancelPin() {
  pin.value = ''
  showPin.value = false
}

async function loadWallet() {
  if (USE_WALLET_MOCK || loading.value) return
  accessError.value = ''
  if (!authStore.user || !childId.value) {
    walletStore.reset()
    accessError.value = '로그인 사용자 정보를 확인할 수 없어요. 다시 로그인해 주세요.'
    return
  }
  try {
    await walletStore.fetchWallet(childId.value)
  } catch {
    // 조회 실패 메시지는 wallet store의 error 상태로 표시합니다.
  }
}

onMounted(loadWallet)
</script>

<style scoped>
.barcode {
  background: repeating-linear-gradient(
    90deg,
    #111 0,
    #111 2px,
    transparent 2px,
    transparent 4px,
    #111 4px,
    #111 5px,
    transparent 5px,
    transparent 8px
  );
}

.payment-card-ratio {
  aspect-ratio: 1488 / 982;
}
</style>
