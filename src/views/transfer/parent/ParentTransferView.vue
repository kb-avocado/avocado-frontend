<!-- 보호자 용돈 보내기 화면: 부모 계좌 -> 아이 선불지갑 -->
<template>
  <main class="flex min-h-full flex-col bg-white px-4 pb-7 pt-6">
    <!-- 송금 완료 -->
    <section v-if="result" class="flex flex-1 flex-col">
      <div class="flex flex-1 flex-col items-center justify-center">
        <CircleCheck :size="52" class="text-avocado-600" />
        <h1 class="mt-5 text-xl font-bold text-gray-900">용돈 보내기를 완료했어요</h1>

        <dl class="mt-8 w-full rounded-2xl bg-gray-50 p-5">
          <div class="flex items-center justify-between">
            <dt class="text-sm text-gray-500">받는 사람</dt>
            <dd class="text-sm font-medium text-gray-900">{{ result.counterpartyName }}</dd>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <dt class="text-sm text-gray-500">용돈</dt>
            <dd class="text-lg font-bold text-gray-900">{{ formatMoney(result.amount) }}원</dd>
          </div>
        </dl>
      </div>

      <RouterLink
        :to="{ name: 'parent-home', params: { childId } }"
        class="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-avocado-600 text-sm font-medium text-white"
      >
        홈으로 돌아가기
      </RouterLink>
    </section>

    <!-- 금액 입력 -->
    <form v-else class="flex flex-1 flex-col" novalidate @submit.prevent="submit">
      <h1 class="text-xl font-bold text-gray-900">{{ childName }}에게 얼마를 보낼까요?</h1>
      <p class="mt-2 text-sm text-gray-500">보호자님의 계좌에서 아이 지갑으로 바로 충전돼요.</p>

      <div class="mt-6 rounded-2xl bg-avocado-50 p-4" aria-live="polite">
        <p class="text-xs text-gray-500">{{ childName }}의 아보카도 지갑</p>
        <p v-if="walletLoading" class="mt-1 text-sm text-gray-400">잔액을 불러오는 중이에요</p>
        <p v-else-if="wallet" class="mt-1 text-lg font-bold text-gray-900">
          현재 {{ formatMoney(wallet.balance) }}원
        </p>
        <p v-else class="mt-1 text-sm text-gray-500">
          {{ walletError || '지갑 잔액을 불러오지 못했어요.' }}
        </p>
      </div>

      <label for="transfer-amount" class="mt-8 block text-sm font-medium text-gray-700">
        보낼 금액
      </label>
      <div class="mt-2 flex items-baseline gap-2 border-b-2 border-avocado-600 pb-2">
        <input
          id="transfer-amount"
          v-model="amountText"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="0"
          class="min-w-0 flex-1 text-right text-3xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
          :disabled="isSending"
          :aria-invalid="Boolean(amountError)"
          @input="onAmountInput"
        />
        <span class="text-lg font-medium text-gray-700">원</span>
      </div>
      <p v-if="amountError" role="alert" class="mt-2 text-sm text-red-600">{{ amountError }}</p>

      <div class="mt-4 flex gap-2">
        <button
          v-for="quickAmount in QUICK_AMOUNTS"
          :key="quickAmount"
          type="button"
          class="flex-1 rounded-full bg-gray-100 py-2 text-sm text-gray-700"
          :disabled="isSending"
          @click="addAmount(quickAmount)"
        >
          +{{ formatMoney(quickAmount) }}
        </button>
      </div>

      <p
        v-if="sendError"
        role="alert"
        aria-live="polite"
        class="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
      >
        {{ sendError }}
      </p>

      <BaseButton
        class="mt-auto h-12 w-full rounded-xl"
        :disabled="!canSubmit || isSending"
        @click="submit"
      >
        <span
          v-if="isSending"
          class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden="true"
        />
        {{ isSending ? '보내는 중...' : '보내기' }}
      </BaseButton>
    </form>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { CircleCheck } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import { transferAccountToWallet } from '@/api/transfer'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'

const QUICK_AMOUNTS = [10000, 30000, 50000]
const MAX_AMOUNT = 1000000

const props = defineProps({
  childId: {
    type: [String, Number],
    required: true
  }
})

const authStore = useAuthStore()
const walletStore = useWalletStore()
const { wallet, loading: walletLoading, error: walletError } = storeToRefs(walletStore)

const amountText = ref('')
const amountError = ref('')
const sendError = ref('')
const isSending = ref(false)
const result = ref(null)

// 로그인 응답에 실려온 연결된 아이 목록에서 이름을 찾는다.
const childName = computed(
  () =>
    (authStore.user?.child ?? []).find((child) => String(child.id) === String(props.childId))
      ?.name ?? '아이'
)

const amount = computed(() => Number(amountText.value.replace(/,/g, '')) || 0)
const canSubmit = computed(() => amount.value > 0 && !amountError.value)

function formatMoney(value) {
  return Number(value ?? 0).toLocaleString('ko-KR')
}

function setAmount(value) {
  const clamped = Math.min(Math.max(value, 0), MAX_AMOUNT)
  amountText.value = clamped === 0 ? '' : formatMoney(clamped)
  amountError.value =
    value > MAX_AMOUNT ? `한 번에 ${formatMoney(MAX_AMOUNT)}원까지 보낼 수 있어요.` : ''
  sendError.value = ''
}

function onAmountInput() {
  setAmount(Number(amountText.value.replace(/[^\d]/g, '')) || 0)
}

function addAmount(value) {
  setAmount(amount.value + value)
}

function getSendErrorMessage(error) {
  const status = error?.response?.status

  if (status === 403) return '이 아이에게 보낼 권한이 없어요. 가족 연결 상태를 확인해 주세요.'
  if (status === 404) return '보호자님의 출금 계좌를 찾을 수 없어요.'
  if (status >= 500) return '서버에 문제가 발생했어요. 잠시 후 다시 시도해주세요.'

  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    '송금하지 못했어요. 다시 시도해주세요.'
  )
}

async function submit() {
  if (isSending.value || !canSubmit.value) return

  isSending.value = true
  sendError.value = ''

  try {
    const response = await transferAccountToWallet({
      childId: props.childId,
      amount: amount.value
    })

    result.value = response.data?.data ?? response.data
  } catch (error) {
    sendError.value = getSendErrorMessage(error)
  } finally {
    isSending.value = false
  }
}

async function loadWallet() {
  try {
    await walletStore.fetchWallet(props.childId)
  } catch {
    // 잔액 조회 실패는 wallet store의 error 상태로 표시한다.
  }
}

onMounted(loadWallet)
</script>
