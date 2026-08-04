<template>
  <main class="flex min-h-full flex-col bg-white p-4">
    <div v-if="entryError" role="alert" class="rounded-xl bg-red-50 p-4">
      <p class="text-sm font-medium text-red-500">
        {{ entryError }}
      </p>
    </div>

    <div v-else class="space-y-5">
      <section v-if="hasRecipient" class="space-y-3" aria-live="polite">
        <h1 class="text-xl font-bold text-gray-900">송금 대상</h1>

        <div v-if="isRecipientLoading" class="animate-pulse rounded-2xl bg-gray-50 p-4">
          <div class="h-5 w-24 rounded bg-gray-200"></div>
          <div class="mt-3 h-4 w-40 rounded bg-gray-200"></div>
          <p class="sr-only">송금 대상 정보를 불러오는 중입니다.</p>
        </div>

        <div
          v-else-if="recipientError"
          role="alert"
          class="rounded-2xl bg-red-50 p-4 text-sm"
        >
          <p class="font-medium text-red-500">{{ recipientError }}</p>
          <button
            type="button"
            class="mt-3 font-semibold text-red-600 underline underline-offset-2"
            @click="fetchRecipient"
          >
            다시 시도
          </button>
        </div>

        <div v-else-if="recipient" class="rounded-2xl bg-gray-50 p-4">
          <dl class="space-y-3">
            <div class="flex items-center justify-between">
              <dt class="text-sm text-gray-500">받는 분</dt>
              <dd class="text-base font-semibold text-gray-900">{{ recipient.name }}</dd>
            </div>

            <div class="flex items-center justify-between">
              <dt class="text-sm text-gray-500">{{ recipient.identifierLabel }}</dt>
              <dd class="text-sm font-medium text-gray-900">{{ recipient.identifier }}</dd>
            </div>

            <div v-if="recipient.userCode" class="flex items-center justify-between">
              <dt class="text-sm text-gray-500">사용자 코드</dt>
              <dd class="text-sm font-medium text-gray-900">{{ recipient.userCode }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section v-else>
        <h1 class="text-xl font-bold text-gray-900">누구에게 송금할까요?</h1>

        <p class="mt-2 text-sm text-gray-500">송금할 지갑 또는 계좌를 선택해주세요.</p>
      </section>

      <section v-if="amount !== null" class="space-y-2">
        <p class="text-sm text-gray-500">송금 금액</p>

        <p class="text-2xl font-bold text-avocado-600">{{ formattedAmount }}원</p>
      </section>

      <section v-else-if="hasRecipient">
        <p class="text-sm text-gray-500">송금할 금액을 입력해주세요.</p>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { TRANSFER_RECIPIENT_SEARCH_TYPE } from '@/constants'
import { getTransferRecipient } from '@/api/transfer'
import { normalizeTransferRecipientKeyword } from '@/utils/transfer'

const route = useRoute()

/**
 * 같은 query가 여러 번 전달될 경우 첫 번째 값만 사용합니다.
 */
function getSingleQueryValue(value) {
  return Array.isArray(value) ? value[0] : value
}

/**
 * query 문자열을 1 이상의 안전한 정수로 변환합니다.
 * 올바르지 않은 값은 null을 반환합니다.
 */
function parsePositiveInteger(value) {
  const queryValue = getSingleQueryValue(value)

  if (queryValue === undefined || queryValue === '') {
    return null
  }

  const parsedValue = Number(queryValue)

  if (!Number.isSafeInteger(parsedValue) || parsedValue <= 0) {
    return null
  }

  return parsedValue
}

const rawSearchType = computed(() => getSingleQueryValue(route.query.searchType))

const rawKeyword = computed(() => getSingleQueryValue(route.query.keyword))

const rawAmount = computed(() => getSingleQueryValue(route.query.amount))

const searchType = computed(() => rawSearchType.value ?? '')

const keyword = computed(() =>
  normalizeTransferRecipientKeyword(searchType.value, rawKeyword.value ?? '')
)

const amount = computed(() => parsePositiveInteger(rawAmount.value))

const hasSearchTypeQuery = computed(() => rawSearchType.value !== undefined)

const hasKeywordQuery = computed(() => rawKeyword.value !== undefined)

const hasAmountQuery = computed(() => rawAmount.value !== undefined)

const hasRecipient = computed(() => searchType.value !== '' && keyword.value !== '')

const formattedAmount = computed(() => amount.value?.toLocaleString('ko-KR'))

const entryError = computed(() => {
  if (hasSearchTypeQuery.value !== hasKeywordQuery.value) {
    return '송금 대상 검색 유형과 검색어를 함께 전달해주세요.'
  }

  if (
    hasSearchTypeQuery.value &&
    !Object.values(TRANSFER_RECIPIENT_SEARCH_TYPE).includes(searchType.value)
  ) {
    return '올바르지 않은 송금 대상 검색 유형입니다.'
  }

  if (hasKeywordQuery.value && keyword.value === '') {
    return '송금 대상 검색어를 입력해주세요.'
  }

  if (
    searchType.value === TRANSFER_RECIPIENT_SEARCH_TYPE.ACCOUNT_NUMBER &&
    !/^\d+$/.test(keyword.value)
  ) {
    return '계좌번호는 숫자만 입력해주세요.'
  }

  if (hasAmountQuery.value && amount.value === null) {
    return '송금 금액은 1원 이상의 정수여야 합니다.'
  }

  return ''
})

const recipient = ref(null)
const recipientError = ref('')
const isRecipientLoading = ref(false)
let requestSequence = 0

function unwrapResponse(response) {
  const body = response?.data
  return body?.data ?? body
}

function normalizeRecipient(data) {
  if (!data || typeof data !== 'object') return null

  const name = data.recipientName
  const accountNumber = data.maskedAccountNumber ?? data.accountNumber

  if (!name || !accountNumber) return null

  return {
    name,
    identifier: [data.bankName, accountNumber].filter(Boolean).join(' '),
    identifierLabel: '계좌번호',
    userCode: data.userCode ?? ''
  }
}

async function fetchRecipient() {
  const currentSequence = ++requestSequence
  recipient.value = null
  recipientError.value = ''

  if (entryError.value || !hasRecipient.value) {
    isRecipientLoading.value = false
    return
  }

  isRecipientLoading.value = true

  try {
    const response = await getTransferRecipient(searchType.value, keyword.value)
    if (currentSequence !== requestSequence) return

    recipient.value = normalizeRecipient(unwrapResponse(response))
    if (!recipient.value) {
      recipientError.value = '송금 대상 정보를 확인할 수 없습니다.'
    }
  } catch (error) {
    if (currentSequence !== requestSequence) return

    recipientError.value =
      error?.response?.status === 404
        ? '존재하지 않는 송금 대상입니다.'
        : (error?.response?.data?.message ?? '송금 대상 정보를 불러오지 못했습니다.')
  } finally {
    if (currentSequence === requestSequence) isRecipientLoading.value = false
  }
}

watch([searchType, keyword, entryError], fetchRecipient, { immediate: true })
</script>
