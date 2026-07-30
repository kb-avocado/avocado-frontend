<template>
  <main class="flex min-h-full flex-col bg-white p-4">
    <div v-if="entryError" role="alert" class="rounded-xl bg-red-50 p-4">
      <p class="text-sm font-medium text-red-500">
        {{ entryError }}
      </p>
    </div>

    <div v-else class="space-y-5">
      <section v-if="hasRecipient" class="space-y-3">
        <h1 class="text-xl font-bold text-gray-900">송금 대상</h1>

        <div class="rounded-2xl bg-gray-50 p-4">
          <dl class="space-y-3">
            <div class="flex items-center justify-between">
              <dt class="text-sm text-gray-500">대상 유형</dt>
              <dd class="text-sm font-medium text-gray-900">
                {{ recipientTypeLabel }}
              </dd>
            </div>

            <div class="flex items-center justify-between">
              <dt class="text-sm text-gray-500">대상 ID</dt>
              <dd class="text-sm font-medium text-gray-900">
                {{ recipientId }}
              </dd>
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
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { TRANSFER_RECIPIENT_TYPE } from '@/constants'

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

const rawRecipientType = computed(() => getSingleQueryValue(route.query.recipientType))

const rawRecipientId = computed(() => getSingleQueryValue(route.query.recipientId))

const rawAmount = computed(() => getSingleQueryValue(route.query.amount))

const recipientType = computed(() => rawRecipientType.value ?? '')

const recipientId = computed(() => parsePositiveInteger(rawRecipientId.value))

const amount = computed(() => parsePositiveInteger(rawAmount.value))

const hasRecipientTypeQuery = computed(() => rawRecipientType.value !== undefined)

const hasRecipientIdQuery = computed(() => rawRecipientId.value !== undefined)

const hasAmountQuery = computed(() => rawAmount.value !== undefined)

const hasRecipient = computed(() => recipientType.value !== '' && recipientId.value !== null)

const recipientTypeLabel = computed(() => {
  if (recipientType.value === TRANSFER_RECIPIENT_TYPE.WALLET) {
    return '아보카도 지갑'
  }

  if (recipientType.value === TRANSFER_RECIPIENT_TYPE.ACCOUNT) {
    return '은행 계좌'
  }

  return ''
})

const formattedAmount = computed(() => amount.value?.toLocaleString('ko-KR'))

const entryError = computed(() => {
  if (hasRecipientTypeQuery.value !== hasRecipientIdQuery.value) {
    return '송금 대상 유형과 대상 ID를 함께 전달해주세요.'
  }

  if (
    hasRecipientTypeQuery.value &&
    !Object.values(TRANSFER_RECIPIENT_TYPE).includes(recipientType.value)
  ) {
    return '올바르지 않은 송금 대상 유형입니다.'
  }

  if (hasRecipientIdQuery.value && recipientId.value === null) {
    return '송금 대상 ID가 올바르지 않습니다.'
  }

  if (hasAmountQuery.value && amount.value === null) {
    return '송금 금액은 1원 이상의 정수여야 합니다.'
  }

  return ''
})
</script>
