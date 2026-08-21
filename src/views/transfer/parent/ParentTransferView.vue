<!-- 보호자 용돈 보내기 화면: 부모 계좌 -> 아이 선불지갑 -->
<template>
  <main class="flex min-h-full flex-col bg-white px-4 pb-7 pt-6">
    <!-- 송금 완료 -->
    <section v-if="result" class="flex flex-1 flex-col">
      <div class="flex flex-1 flex-col items-center justify-center">
        <CircleCheck :size="52" class="text-avocado-600" />

        <h1 class="mt-5 text-xl font-bold text-gray-900">용돈을 보냈어요</h1>

        <dl class="mt-8 w-full rounded-2xl bg-gray-50 p-5">
          <div class="flex items-center justify-between">
            <dt class="text-sm text-gray-500">받는 사람</dt>

            <dd class="text-sm font-medium text-gray-900">
              {{ result.counterpartyName }}
            </dd>
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
      <!-- 상단 타이틀 -->
      <h1 class="text-lg font-bold text-gray-900">{{ childName }}에게 용돈을 보내요</h1>

      <p class="mt-2 text-sm text-gray-500">아이의 아보카도 지갑으로 바로 충전돼요</p>

      <!-- 아이 지갑 잔액 카드 -->
      <div class="mt-5 rounded-2xl p-5" style="background-color: #eef0fb" aria-live="polite">
        <p class="text-xs text-gray-500">{{ childName }}의 아보카도 지갑</p>

        <p v-if="walletLoading" class="mt-1 text-sm text-gray-400">잔액을 불러오는 중이에요</p>

        <p v-else-if="wallet" class="mt-1 text-lg font-bold text-gray-900">
          {{ formatMoney(wallet.balance) }}원
        </p>

        <p v-else class="mt-1 text-sm text-gray-500">
          {{ walletError || '지갑 잔액을 불러오지 못했어요.' }}
        </p>
      </div>

      <!-- 용돈 -->
      <p class="mt-6 text-sm font-medium text-gray-700">용돈</p>

      <!-- 금액 표시 -->
      <div class="mt-2 flex items-baseline justify-end gap-2">
        <p class="min-w-0 flex-1 text-right text-2xl font-bold text-gray-900" aria-live="polite">
          {{ formatMoney(amount) }}
        </p>

        <span class="text-lg font-medium text-gray-700"> 원 </span>
      </div>

      <!-- 구분선 -->
      <div class="mt-2 border-t border-gray-200"></div>

      <!-- 금액 오류 -->
      <p v-if="amountError" role="alert" class="mt-2 text-sm text-red-600">
        {{ amountError }}
      </p>

      <!-- 빠른 금액 선택 + 모두 지우기 -->
      <div class="mt-3 flex items-center justify-center gap-2">
        <button
          v-for="quickAmount in QUICK_AMOUNTS"
          :key="quickAmount"
          type="button"
          class="h-10 rounded-full bg-gray-100 px-4 text-sm text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isSending"
          @click="addAmount(quickAmount)"
        >
          +{{ formatMoney(quickAmount) }}
        </button>

        <button
          type="button"
          class="h-10 rounded-full bg-gray-100 font-bold px-4 text-[10px] text-gray-500 transition-colors hover:bg-gray-200"
          @click="clearAmount"
        >
          모두 지우기
        </button>
      </div>

      <!-- 키패드 + 보내기 버튼: 위쪽 내용 길이와 상관없이 항상 화면 하단에 고정 -->
      <div class="sticky bottom-0 z-0 mt-auto -mx-4 w-[calc(100%+2rem)] bg-white px-4 pt-2">
        <!-- 키패드 -->
        <NumberKeypad
          mode="amount"
          :disabled="isSending"
          @input="appendDigit"
          @delete="deleteDigit"
        />

        <!-- 송금 오류 -->
        <p
          v-if="sendError"
          role="alert"
          aria-live="polite"
          class="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {{ sendError }}
        </p>

        <!-- 보내기 버튼 -->
        <div class="mt-5 px-4">
          <BaseButton
            variant="primary"
            class="w-full gap-2"
            style="height: 44px"
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
        </div>
      </div>
    </form>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { CircleCheck } from 'lucide-vue-next'

import BaseButton from '@/components/common/BaseButton.vue'
import NumberKeypad from '@/components/common/NumberKeypad.vue'

import { transferAccountToWallet } from '@/api/transfer'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'

const QUICK_AMOUNTS = [10000, 30000, 50000]
const MAX_AMOUNT = 1000000
const MAX_AMOUNT_LENGTH = 9 // 최대 9자리까지만 입력 허용

const props = defineProps({
  childId: {
    type: [String, Number],
    required: true
  }
})

const route = useRoute()

const authStore = useAuthStore()
const walletStore = useWalletStore()

const { wallet, loading: walletLoading, error: walletError } = storeToRefs(walletStore)

const amountInput = ref('')
const sendError = ref('')
const isSending = ref(false)
const result = ref(null)

/* 로그인 응답의 연결된 아이 목록에서 현재 아이 이름 조회 */
const childName = computed(
  () =>
    (authStore.user?.child ?? []).find((child) => String(child.id) === String(props.childId))
      ?.name ?? '아이'
)

/* 실제 송금 금액 */
const amount = computed(() => Number(amountInput.value || 0))

/* 금액 오류 */
const amountError = computed(() => {
  if (amount.value > MAX_AMOUNT) return `한 번에 ${formatMoney(MAX_AMOUNT)}원까지 보낼 수 있어요.`
  return ''
})

/* 송금 버튼 활성화 조건 */
const canSubmit = computed(() => amount.value > 0 && !amountError.value)

/* 금액 천 단위 콤마 */
function formatMoney(value) {
  return Number(value ?? 0).toLocaleString('ko-KR')
}

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

/* 빠른 금액 추가 */
function addAmount(value) {
  sendError.value = ''
  amountInput.value = String(Math.min(amount.value + value, MAX_AMOUNT))
}

/* 입력 금액 전체 삭제 */
function clearAmount() {
  sendError.value = ''
  amountInput.value = ''
}

/* 송금 실패 메시지 */
function getSendErrorMessage(error) {
  const status = error?.response?.status

  if (status === 403) {
    return '이 아이에게 보낼 권한이 없어요. 가족 연결 상태를 확인해 주세요.'
  }

  if (status === 404) {
    return '보호자님의 출금 계좌를 찾을 수 없어요.'
  }

  if (status >= 500) {
    return '서버에 문제가 발생했어요. 잠시 후 다시 시도해주세요.'
  }

  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    '송금하지 못했어요. 다시 시도해주세요.'
  )
}

/* 용돈 보내기 */
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

/* 아이 지갑 잔액 조회 */
async function loadWallet() {
  try {
    await walletStore.fetchWallet(props.childId)
  } catch {
    // wallet store의 error 상태로 표시
  }
}

/* query로 넘어온 초기 송금 금액 적용 */
function applyInitialAmountFromQuery() {
  const initialAmount = Number(route.query.amount)

  if (Number.isFinite(initialAmount) && initialAmount > 0) {
    amountInput.value = String(Math.min(initialAmount, MAX_AMOUNT))
  }
}

onMounted(loadWallet)
onMounted(applyInitialAmountFromQuery)
</script>
