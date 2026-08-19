<template>
  <div class="min-h-full bg-gray-50">
    <header class="border-b border-gray-100 bg-white px-5 pb-5 pt-16">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold text-avocado-600">ADMIN PAYMENT TOOL</p>
          <h1 class="mt-1 text-2xl font-bold text-gray-900">POS 시뮬레이터</h1>
          <p class="mt-2 text-sm text-gray-500">결제 대기 중인 QR로 결제를 테스트해요.</p>
        </div>

        <BaseButton
          variant="outline"
          size="sm"
          class="shrink-0"
          :disabled="isTokenLoading || isSubmitting"
          aria-label="활성 QR 토큰 새로고침"
          @click="fetchActiveTokens()"
        >
          <RefreshCw
            :size="15"
            class="mr-1.5"
            :class="{ 'animate-spin': isTokenLoading }"
            aria-hidden="true"
          />
          새로고침
        </BaseButton>
      </div>

      <div class="mt-5 flex items-center justify-between rounded-2xl bg-avocado-100 px-4 py-3">
        <span class="text-sm font-medium text-gray-700">현재 활성 QR 토큰</span>
        <strong class="text-lg text-avocado-600" aria-live="polite"
          >{{ activeTokenCount }}개</strong
        >
      </div>
    </header>

    <div class="space-y-5 px-4 py-5">
      <section aria-labelledby="active-qr-title" class="rounded-3xl bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 id="active-qr-title" class="text-base font-bold text-gray-900">활성 QR 토큰</h2>
          <span class="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <span class="h-1.5 w-1.5 rounded-full bg-avocado-600" aria-hidden="true" />
            자동 갱신
          </span>
        </div>

        <div
          v-if="isTokenLoading"
          class="flex min-h-44 flex-col items-center justify-center text-center"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle :size="36" class="animate-spin text-avocado-600" aria-hidden="true" />
          <p class="mt-3 text-sm text-gray-500">QR 토큰을 불러오고 있어요.</p>
        </div>

        <div
          v-else-if="tokenError"
          class="flex min-h-44 flex-col items-center justify-center px-3 text-center"
          role="alert"
        >
          <CircleAlert :size="38" class="text-red-500" aria-hidden="true" />
          <p class="mt-3 text-sm font-semibold text-gray-900">목록을 불러오지 못했어요</p>
          <p class="mt-1 text-sm leading-5 text-gray-500">{{ tokenError }}</p>
          <BaseButton class="mt-4" size="sm" @click="fetchActiveTokens()">다시 시도</BaseButton>
        </div>

        <div
          v-else-if="qrTokens.length === 0"
          class="flex min-h-44 flex-col items-center justify-center text-center"
          role="status"
        >
          <QrCode :size="40" class="text-gray-300" aria-hidden="true" />
          <p class="mt-3 text-sm font-semibold text-gray-800">결제 대기 중인 QR이 없어요</p>
          <p class="mt-1 text-xs text-gray-400">QR을 발급한 뒤 새로고침해 주세요.</p>
        </div>

        <ul v-else class="mt-4 space-y-3">
          <li v-for="item in qrTokens" :key="item.token">
            <button
              type="button"
              class="w-full rounded-2xl border p-4 text-left transition"
              :class="tokenButtonClass(item)"
              :disabled="getRemainingSeconds(item) === 0 || isSubmitting"
              :aria-pressed="selectedToken === item.token"
              @click="selectToken(item)"
            >
              <span class="flex items-start gap-3">
                <span
                  class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  :class="
                    selectedToken === item.token
                      ? 'bg-avocado-600 text-white'
                      : 'bg-gray-100 text-gray-500'
                  "
                >
                  <CircleCheck v-if="selectedToken === item.token" :size="18" aria-hidden="true" />
                  <UserRound v-else :size="18" aria-hidden="true" />
                </span>

                <span class="min-w-0 flex-1">
                  <span class="flex items-center justify-between gap-3">
                    <span class="min-w-0">
                      <strong class="block truncate text-sm text-gray-900">
                        {{ displayValue(item.userName) }}
                      </strong>
                      <span class="mt-0.5 block text-xs text-gray-500">
                        사용자 ID {{ displayValue(item.userId) }}
                      </span>
                    </span>
                    <span
                      class="inline-flex shrink-0 items-center gap-1 text-xs font-semibold tabular-nums"
                      :class="getRemainingSeconds(item) === 0 ? 'text-red-500' : 'text-avocado-600'"
                    >
                      <Clock3 :size="14" aria-hidden="true" />
                      {{
                        getRemainingSeconds(item) === 0
                          ? '만료'
                          : formatRemainingTime(getRemainingSeconds(item))
                      }}
                    </span>
                  </span>
                  <span
                    class="mt-1.5 block truncate font-mono text-xs text-gray-500"
                    :title="item.token"
                  >
                    {{ shortenToken(item.token) }}
                  </span>
                </span>
              </span>
            </button>
          </li>
        </ul>
      </section>

      <section aria-labelledby="payment-form-title" class="rounded-3xl bg-white p-4 shadow-sm">
        <h2 id="payment-form-title" class="text-base font-bold text-gray-900">결제 요청</h2>

        <form class="mt-5 space-y-5" novalidate @submit.prevent="handleSimulation">
          <div>
            <p class="text-xs font-medium text-gray-600">선택된 QR 토큰</p>
            <div
              class="mt-2 min-h-14 rounded-2xl border px-4 py-3"
              :class="
                selectedQr ? 'border-avocado-300 bg-avocado-100' : 'border-gray-200 bg-gray-50'
              "
              aria-live="polite"
            >
              <p v-if="selectedQr" class="break-all font-mono text-xs leading-5 text-gray-700">
                {{ selectedQr.token }}
              </p>
              <p v-else class="text-sm text-gray-400">위 목록에서 QR 토큰을 선택해 주세요.</p>
            </div>
            <p
              v-if="selectedQr && selectedRemainingSeconds === 0"
              class="mt-2 text-xs text-red-500"
            >
              선택한 QR이 만료됐어요. 목록을 새로고침해 주세요.
            </p>
          </div>

          <div>
            <label for="payment-amount" class="block text-xs font-medium text-gray-600">
              결제 금액
            </label>
            <div class="relative mt-2">
              <input
                id="payment-amount"
                :value="amountInput"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder="1원 이상 입력"
                class="h-14 w-full rounded-2xl border bg-white px-4 pr-11 text-right text-lg font-bold text-gray-900 outline-none transition placeholder:text-sm placeholder:font-normal placeholder:text-gray-300 focus:border-avocado-600 focus:ring-2 focus:ring-avocado-100"
                :class="showAmountError ? 'border-red-400' : 'border-gray-200'"
                :disabled="isSubmitting"
                :aria-invalid="showAmountError"
                :aria-describedby="showAmountError ? 'payment-amount-error' : undefined"
                @input="handleAmountInput"
                @blur="amountTouched = true"
              />
              <span
                class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500"
              >
                원
              </span>
            </div>
            <p
              v-if="showAmountError"
              id="payment-amount-error"
              class="mt-2 text-xs text-red-500"
              role="alert"
            >
              {{ amountError }}
            </p>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="merchant-search" class="block text-xs font-medium text-gray-600">
                가맹점
              </label>
              <span
                class="text-xs font-medium"
                :class="selectedMerchant ? 'text-avocado-600' : 'text-gray-400'"
              >
                {{
                  selectedMerchant
                    ? `${selectedMerchant.id} · ${selectedMerchant.name}`
                    : '선택 안 됨'
                }}
              </span>
            </div>

            <div class="relative mt-2">
              <Search
                :size="16"
                class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="merchant-search"
                v-model="merchantSearch"
                type="text"
                autocomplete="off"
                placeholder="가맹점명 또는 업종으로 검색"
                class="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-avocado-600 focus:ring-2 focus:ring-avocado-100"
                :disabled="isSubmitting"
              />
            </div>

            <div class="mt-2 flex gap-1.5 rounded-2xl bg-gray-100 p-1">
              <button
                v-for="filter in merchantFilterOptions"
                :key="filter.value"
                type="button"
                class="flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition"
                :class="
                  merchantFilter === filter.value
                    ? 'bg-white text-avocado-600 shadow-sm'
                    : 'text-gray-500'
                "
                :disabled="isSubmitting"
                @click="merchantFilter = filter.value"
              >
                {{ filter.label }}
              </button>
            </div>

            <div
              class="mt-2 max-h-64 space-y-1.5 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-2"
              role="listbox"
              aria-label="가맹점 선택"
            >
              <button
                v-for="merchant in filteredMerchants"
                :key="merchant.id"
                type="button"
                class="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition"
                :class="merchantButtonClass(merchant)"
                role="option"
                :aria-selected="merchantId === merchant.id"
                :disabled="isSubmitting"
                @click="merchantId = merchant.id"
              >
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-medium text-gray-900">
                    {{ merchant.name }}
                  </span>
                  <span class="mt-0.5 block text-xs text-gray-500">
                    {{ merchant.id }} · {{ merchant.category }}
                  </span>
                </span>
                <span
                  v-if="merchant.restricted"
                  class="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-500"
                >
                  결제 제한
                </span>
                <CircleCheck
                  v-if="merchantId === merchant.id"
                  :size="18"
                  class="shrink-0 text-avocado-600"
                  aria-hidden="true"
                />
              </button>

              <p v-if="!filteredMerchants.length" class="py-6 text-center text-xs text-gray-400">
                검색 결과가 없어요.
              </p>
            </div>
          </div>

          <fieldset>
            <legend class="text-xs font-medium text-gray-600">요청 결과</legend>
            <div class="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1.5">
              <label
                v-for="option in resultOptions"
                :key="option.value"
                class="cursor-pointer rounded-xl px-3 py-3 text-center text-sm font-semibold transition"
                :class="
                  requestedResult === option.value
                    ? 'bg-white text-avocado-600 shadow-sm'
                    : 'text-gray-500'
                "
              >
                <input
                  v-model="requestedResult"
                  type="radio"
                  name="requested-result"
                  class="sr-only"
                  :value="option.value"
                  :disabled="isSubmitting"
                />
                {{ option.label }}
              </label>
            </div>
          </fieldset>

          <p
            v-if="simulationError"
            class="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-5 text-red-600"
            role="alert"
            aria-live="polite"
          >
            {{ simulationError }}
          </p>

          <BaseButton
            class="h-12 w-full rounded-xl text-base"
            :disabled="!canSubmit"
            @click="handleSimulation"
          >
            <LoaderCircle
              v-if="isSubmitting"
              :size="18"
              class="mr-2 animate-spin"
              aria-hidden="true"
            />
            {{ isSubmitting ? '결제 처리 중...' : '결제 실행' }}
          </BaseButton>
        </form>
      </section>

      <section
        v-if="simulationResult"
        aria-labelledby="simulation-result-title"
        class="rounded-3xl border bg-white p-5 shadow-sm"
        :class="simulationResult.status === 'SUCCESS' ? 'border-avocado-300' : 'border-red-200'"
        :role="simulationResult.status === 'SUCCESS' ? 'status' : 'alert'"
        aria-live="polite"
      >
        <div class="flex items-center gap-3">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            :class="
              simulationResult.status === 'SUCCESS'
                ? 'bg-avocado-100 text-avocado-600'
                : 'bg-red-50 text-red-500'
            "
          >
            <CircleCheck
              v-if="simulationResult.status === 'SUCCESS'"
              :size="24"
              aria-hidden="true"
            />
            <CircleX v-else :size="24" aria-hidden="true" />
          </span>
          <div>
            <h2 id="simulation-result-title" class="text-lg font-bold text-gray-900">
              {{
                simulationResult.status === 'SUCCESS' ? '결제에 성공했어요' : '결제에 실패했어요'
              }}
            </h2>
            <p v-if="simulationResult.message" class="mt-0.5 text-xs text-gray-500">
              {{ simulationResult.message }}
            </p>
          </div>
        </div>

        <dl class="mt-5 divide-y divide-gray-100 rounded-2xl bg-gray-50 px-4">
          <template v-if="simulationResult.status === 'SUCCESS'">
            <div class="flex items-center justify-between gap-4 py-3">
              <dt class="text-xs text-gray-500">가맹점명</dt>
              <dd class="text-right text-sm font-semibold text-gray-900">
                {{ displayValue(simulationResult.merchantName) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 py-3">
              <dt class="text-xs text-gray-500">결제 금액</dt>
              <dd class="text-sm font-semibold text-gray-900">
                {{ formatMoney(simulationResult.amount) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 py-3">
              <dt class="text-xs text-gray-500">거래 ID</dt>
              <dd class="text-sm font-semibold text-gray-900">
                {{ displayValue(simulationResult.walletHistoryId) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 py-3">
              <dt class="text-xs text-gray-500">결제 후 잔액</dt>
              <dd class="text-sm font-semibold text-avocado-600">
                {{ formatMoney(simulationResult.balanceAfter) }}
              </dd>
            </div>
          </template>

          <template v-else>
            <div class="flex items-center justify-between gap-4 py-3">
              <dt class="text-xs text-gray-500">실패 코드</dt>
              <dd class="break-all text-right font-mono text-xs font-semibold text-red-600">
                {{ displayValue(simulationResult.failureCode) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 py-3">
              <dt class="text-xs text-gray-500">결제 금액</dt>
              <dd class="text-sm font-semibold text-gray-900">
                {{ formatMoney(simulationResult.amount) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 py-3">
              <dt class="text-xs text-gray-500">가맹점 ID</dt>
              <dd class="text-sm font-semibold text-gray-900">
                {{ displayValue(simulationResult.merchantId) }}
              </dd>
            </div>
            <div
              v-if="simulationResult.merchantName"
              class="flex items-center justify-between gap-4 py-3"
            >
              <dt class="text-xs text-gray-500">가맹점명</dt>
              <dd class="text-right text-sm font-semibold text-gray-900">
                {{ simulationResult.merchantName }}
              </dd>
            </div>
          </template>
        </dl>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock3,
  LoaderCircle,
  QrCode,
  RefreshCw,
  Search,
  UserRound
} from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import { getActivePaymentQrTokens, simulatePayment } from '@/api/payment'

const TOKEN_POLL_INTERVAL = 2000

const resultOptions = [
  { value: 'SUCCESS', label: '정상 결제' },
  { value: 'FORCE_FAIL', label: '강제 실패' }
]

const MERCHANTS = [
  { id: 3001, name: 'CU 강남점', category: '편의점', restricted: false },
  { id: 3002, name: 'GS25 역삼점', category: '편의점', restricted: false },
  { id: 3003, name: '세븐일레븐 선릉점', category: '편의점', restricted: false },
  { id: 3004, name: '우리동네마트 강남점', category: '슈퍼마켓', restricted: false },
  { id: 3005, name: '행복마트 역삼점', category: '슈퍼마켓', restricted: false },
  { id: 3006, name: '강남김밥', category: '일반한식', restricted: false },
  { id: 3007, name: '역삼분식', category: '분식', restricted: false },
  { id: 3008, name: '선릉돈까스', category: '일반양식', restricted: false },
  { id: 3009, name: '강남반점', category: '중식', restricted: false },
  { id: 3010, name: '스시하루 강남점', category: '일식', restricted: false },
  { id: 3011, name: '햇살베이커리', category: '제과점', restricted: false },
  { id: 3012, name: '강남커피하우스', category: '커피전문점', restricted: false },
  { id: 3013, name: '역삼카페', category: '커피전문점', restricted: false },
  { id: 3014, name: '버거하우스 강남점', category: '패스트푸드', restricted: false },
  { id: 3015, name: '피자마을 역삼점', category: '패스트푸드', restricted: false },
  { id: 3016, name: '꿈나무문구', category: '문구점', restricted: false },
  { id: 3017, name: '강남서점', category: '서점', restricted: false },
  { id: 3018, name: '아이조아완구', category: '완구점', restricted: false },
  { id: 3019, name: '드림스포츠', category: '스포츠용품점', restricted: false },
  { id: 3020, name: '강남의류마켓', category: '의류판매점', restricted: false },
  { id: 3021, name: '강남온누리약국', category: '약국', restricted: false },
  { id: 3022, name: '우리소아청소년과', category: '병원·의원', restricted: false },
  { id: 3023, name: '튼튼치과', category: '치과', restricted: false },
  { id: 3024, name: '꿈나무영어학원', category: '학원', restricted: false },
  { id: 3025, name: '강남포차', category: '일반주점', restricted: true },
  { id: 3026, name: '역삼호프', category: '일반주점', restricted: true },
  { id: 3027, name: '블루문 단란주점', category: '단란주점', restricted: true },
  { id: 3028, name: '스타 유흥주점', category: '유흥주점', restricted: true },
  { id: 3029, name: '와인앤리커 강남점', category: '주류전문판매점', restricted: true },
  { id: 3030, name: '어덜트샵 강남점', category: '성인용품점', restricted: true }
]

const qrTokens = ref([])
const selectedToken = ref('')
const currentTime = ref(Date.now())
const isTokenLoading = ref(false)
const isTokenBackgroundRefreshing = ref(false)
const tokenError = ref('')

const merchantFilterOptions = [
  { value: 'ALL', label: '전체' },
  { value: 'GENERAL', label: '일반' },
  { value: 'RESTRICTED', label: '결제 제한' }
]

const amountInput = ref('')
const amountTouched = ref(false)
const merchantId = ref(null)
const merchantSearch = ref('')
const merchantFilter = ref('ALL')
const requestedResult = ref('SUCCESS')
const isSubmitting = ref(false)
const simulationError = ref('')
const simulationResult = ref(null)

let tokenTimer = null
let tokenPollingTimer = null
let tokenFetchSequence = 0
let isUnmounted = false

const selectedQr = computed(
  () => qrTokens.value.find((item) => item.token === selectedToken.value) ?? null
)

const selectedRemainingSeconds = computed(() =>
  selectedQr.value ? getRemainingSeconds(selectedQr.value) : 0
)

const activeTokenCount = computed(
  () => qrTokens.value.filter((item) => getRemainingSeconds(item) > 0).length
)

const selectedMerchant = computed(
  () => MERCHANTS.find((merchant) => merchant.id === merchantId.value) ?? null
)

const filteredMerchants = computed(() => {
  const keyword = merchantSearch.value.trim().toLowerCase()

  return MERCHANTS.filter((merchant) => {
    if (merchantFilter.value === 'GENERAL' && merchant.restricted) return false
    if (merchantFilter.value === 'RESTRICTED' && !merchant.restricted) return false
    if (!keyword) return true

    return (
      merchant.name.toLowerCase().includes(keyword) ||
      merchant.category.toLowerCase().includes(keyword) ||
      String(merchant.id).includes(keyword)
    )
  })
})

const numericAmount = computed(() => Number(amountInput.value))

const isAmountValid = computed(
  () =>
    /^\d+$/.test(amountInput.value) &&
    Number.isSafeInteger(numericAmount.value) &&
    numericAmount.value >= 1
)

const amountError = computed(() => {
  if (!amountInput.value) return '결제 금액을 입력해 주세요.'
  if (!Number.isSafeInteger(numericAmount.value)) return '올바른 결제 금액을 입력해 주세요.'
  return '결제 금액은 1원 이상이어야 해요.'
})

const showAmountError = computed(() => amountTouched.value && !isAmountValid.value)

const canSubmit = computed(
  () =>
    Boolean(selectedQr.value) &&
    selectedRemainingSeconds.value > 0 &&
    isAmountValid.value &&
    Boolean(selectedMerchant.value) &&
    !isTokenLoading.value &&
    !isSubmitting.value
)

function stopTokenTimer() {
  if (tokenTimer) {
    clearInterval(tokenTimer)
    tokenTimer = null
  }
}

function stopActiveTokenPolling() {
  if (tokenPollingTimer) {
    clearTimeout(tokenPollingTimer)
    tokenPollingTimer = null
  }
}

function scheduleActiveTokenPolling() {
  stopActiveTokenPolling()
  if (isUnmounted) return

  tokenPollingTimer = setTimeout(async () => {
    tokenPollingTimer = null
    await fetchActiveTokens({ silent: true })
    scheduleActiveTokenPolling()
  }, TOKEN_POLL_INTERVAL)
}

function startTokenTimer() {
  stopTokenTimer()
  if (isUnmounted) return

  currentTime.value = Date.now()

  if (!qrTokens.value.some((item) => getRemainingSeconds(item) > 0)) return

  tokenTimer = setInterval(() => {
    currentTime.value = Date.now()

    if (!qrTokens.value.some((item) => getRemainingSeconds(item) > 0)) {
      stopTokenTimer()
    }
  }, 1000)
}

function getRemainingSeconds(item) {
  return Math.max(0, Math.ceil((item.expiresAt - currentTime.value) / 1000))
}

function formatRemainingTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function shortenToken(token) {
  if (token.length <= 18) return token
  return `${token.slice(0, 9)}…${token.slice(-7)}`
}

function displayValue(value) {
  return value == null || value === '' ? '-' : value
}

function formatMoney(value) {
  if (value == null || !Number.isFinite(Number(value))) return '-'
  return `${Number(value).toLocaleString('ko-KR')}원`
}

function getApiErrorMessage(error, fallback) {
  return error?.response?.data?.error?.message || error?.response?.data?.message || fallback
}

function tokenButtonClass(item) {
  if (getRemainingSeconds(item) === 0) {
    return 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
  }

  if (selectedToken.value === item.token) {
    return 'border-avocado-300 bg-avocado-100 ring-1 ring-avocado-300'
  }

  return 'border-gray-200 bg-white hover:border-avocado-300 hover:bg-avocado-50'
}

function merchantButtonClass(merchant) {
  if (merchantId.value === merchant.id) {
    return 'border-avocado-300 bg-avocado-100 ring-1 ring-avocado-300'
  }

  return 'border-gray-200 bg-white hover:border-avocado-300 hover:bg-avocado-50'
}

function selectToken(item) {
  if (item.expiresAt <= Date.now() || isSubmitting.value) return

  if (selectedToken.value !== item.token) {
    simulationResult.value = null
  }

  selectedToken.value = item.token
  simulationError.value = ''
}

function handleAmountInput(event) {
  simulationError.value = ''

  if (!/^\d*$/.test(event.target.value)) {
    event.target.value = amountInput.value
    amountTouched.value = true
    return
  }

  amountInput.value = event.target.value
}

async function fetchActiveTokens({ silent = false } = {}) {
  if (isUnmounted) return

  if (silent) {
    if (isTokenBackgroundRefreshing.value || isTokenLoading.value || isSubmitting.value) return
    isTokenBackgroundRefreshing.value = true
  } else {
    if (isTokenLoading.value) return
    isTokenLoading.value = true
    tokenError.value = ''
    stopTokenTimer()
  }

  const fetchSequence = ++tokenFetchSequence

  try {
    const response = await getActivePaymentQrTokens()
    if (isUnmounted || fetchSequence !== tokenFetchSequence) return

    const data = response.data?.data

    if (response.data?.success === false) {
      if (!silent) {
        qrTokens.value = []
        selectedToken.value = ''
        tokenError.value =
          response.data?.error?.message ||
          response.data?.message ||
          'QR 토큰 목록을 불러오지 못했어요.'
      }
      return
    }

    if (!Array.isArray(data)) {
      throw new Error('Invalid QR token response')
    }

    const fetchedAt = Date.now()
    currentTime.value = fetchedAt
    tokenError.value = ''
    qrTokens.value = data
      .map((item) => ({
        token: String(item?.token ?? ''),
        userId: item?.userId ?? null,
        userName: typeof item?.userName === 'string' ? item.userName.trim() : '',
        expiresAt: fetchedAt + Math.max(0, Math.floor(Number(item?.expiresIn) || 0)) * 1000
      }))
      .filter((item) => item.token)

    if (!qrTokens.value.some((item) => item.token === selectedToken.value)) {
      selectedToken.value = ''
    }

    startTokenTimer()
  } catch (error) {
    if (isUnmounted || fetchSequence !== tokenFetchSequence) return

    if (!silent) {
      qrTokens.value = []
      selectedToken.value = ''
      tokenError.value = getApiErrorMessage(error, 'QR 토큰 목록을 불러오지 못했어요.')
    }
  } finally {
    if (silent) {
      isTokenBackgroundRefreshing.value = false
    } else {
      isTokenLoading.value = false
    }
  }
}

async function handleSimulation() {
  amountTouched.value = true

  if (selectedQr.value && selectedQr.value.expiresAt <= Date.now()) {
    currentTime.value = Date.now()
    simulationError.value = '선택한 QR이 만료됐어요. 목록을 새로고침해 주세요.'
    return
  }

  if (!canSubmit.value) return

  tokenFetchSequence += 1
  isSubmitting.value = true
  simulationError.value = ''
  simulationResult.value = null

  try {
    const response = await simulatePayment({
      qrToken: selectedToken.value,
      merchantId: Number(merchantId.value),
      amount: numericAmount.value,
      requestedResult: requestedResult.value
    })
    const result = response.data?.data

    if (response.data?.success === false) {
      simulationError.value =
        response.data?.error?.message || response.data?.message || '결제 요청을 처리하지 못했어요.'
      return
    }

    if (!['SUCCESS', 'FAILED'].includes(result?.status)) {
      simulationError.value = '결제 처리 결과를 확인하지 못했어요.'
      return
    }

    simulationResult.value = {
      ...result,
      message: response.data?.message ?? '',
      status: result.status
    }
  } catch (error) {
    simulationError.value = getApiErrorMessage(error, '결제 요청을 처리하지 못했어요.')
  } finally {
    await fetchActiveTokens()
    isSubmitting.value = false
  }
}

async function initializeActiveTokenPolling() {
  await fetchActiveTokens()
  scheduleActiveTokenPolling()
}

onMounted(initializeActiveTokenPolling)
onUnmounted(() => {
  isUnmounted = true
  tokenFetchSequence += 1
  stopTokenTimer()
  stopActiveTokenPolling()
})
</script>
