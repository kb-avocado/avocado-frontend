<template>
  <div class="min-h-screen flex flex-col bg-white overflow-hidden">
    <AppHeader title="저금하기" show-back :show-bell="false" :show-avatar="false" @click-back="router.back()" />

    <div class="flex-1 flex flex-col transition-transform duration-500 ease-out"
      :class="pageRevealed ? 'translate-y-0' : 'translate-y-full'">
      <div class="flex-1 flex flex-col p-4" v-if="item">
        <div class="rounded-2xl bg-avocado-100 p-4 text-center space-y-1">
          <p class="text-sm text-muted">{{ item.name }}</p>
          <p class="text-xs text-muted">
            남은 금액
            <span class="font-semibold text-avocado-900">{{ formatCurrency(remainingAmount) }}</span>
          </p>
        </div>

        <div class="flex-1 flex flex-col items-center justify-center gap-2">
          <p class="text-sm font-medium text-avocado-900">얼마를 저금할까요?</p>
          <p class="text-3xl font-bold text-avocado-900">
            {{ formatCurrency(Number(amountInput || 0)) }}
          </p>
          <p v-if="errorMessage" class="text-sm text-red-500 text-center">{{ errorMessage }}</p>
        </div>

        <NumberKeypad mode="amount" @input="appendDigit" @delete="deleteDigit" />
      </div>

      <div class="p-4">
        <BaseButton variant="primary" class="w-full" :disabled="!canSubmit" @click="handleSubmit">
          {{ isSubmitting ? '저금하는 중...' : '저금하기' }}
        </BaseButton>
      </div>
    </div>

    <!-- 저금 성공 팝업 -->
    <ResultModal v-model="showSuccess" variant="success" :message="successMessage" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/common/AppHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import NumberKeypad from '@/components/common/NumberKeypad.vue'

import { depositToPiggyBank } from '@/api/piggy'
import { usePiggyBankStore } from '@/stores/piggyBank'
import { isValidAmount } from '@/utils/validators'
import { formatCurrency } from '@/utils/format'
import ResultModal from '@/components/common/ResultModal.vue'

const route = useRoute()
const router = useRouter()
const store = usePiggyBankStore()

const piggyBankId = computed(() => route.params.id)

onMounted(() => {
  store.loadDetail(piggyBankId.value)
})

onMounted(() => {
  store.loadDetail(piggyBankId.value)
  requestAnimationFrame(() => {
    pageRevealed.value = true
  })
})

const item = computed(() => store.detail)

const remainingAmount = computed(() =>
  Math.max(0, Number(item.value?.targetAmount || 0) - Number(item.value?.savedAmount || 0))
)

const amountInput = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const successMessage = ref('저금되었어요')
const pageRevealed = ref(false)
const MAX_AMOUNT_LENGTH = 9 // 최대 9자리(약 9억 9999만원)까지만 입력 허용

/* 키패드 숫자 입력 */
function appendDigit(value) {
  errorMessage.value = ''
  if (amountInput.value.length >= MAX_AMOUNT_LENGTH) return
  if (amountInput.value === '' && value === '00') return // 처음부터 00 입력은 무시
  amountInput.value += value
}

/* 키패드 한 자리 지우기 */
function deleteDigit() {
  errorMessage.value = ''
  amountInput.value = amountInput.value.slice(0, -1)
}

const canSubmit = computed(() => isValidAmount(amountInput.value) && !isSubmitting.value)

async function handleSubmit() {
  if (!canSubmit.value) return

  const amount = Number(amountInput.value)
  if (amount > remainingAmount.value) {
    errorMessage.value = `목표 금액을 넘을 수 없어요. 최대 ${formatCurrency(remainingAmount.value)}까지 저금할 수 있어요.`
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const response = await depositToPiggyBank(piggyBankId.value, { amount })

    successMessage.value = response.data.data.goalReached
      ? '목표를 다 모았어요! 🎉'
      : '저금되었어요'
    showSuccess.value = true

    setTimeout(() => {
      router.replace({ name: 'piggyChildDetail', params: { id: piggyBankId.value } })
    }, 1200)
  } catch (e) {
    errorMessage.value = e.response?.data?.message || '저금에 실패했어요. 다시 시도해주세요.'
    isSubmitting.value = false
  }
}
</script>