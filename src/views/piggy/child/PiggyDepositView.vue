<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppHeader title="저금하기" show-back :show-bell="false" :show-avatar="false" @click-back="router.back()" />

    <div class="flex-1 p-4 space-y-6" v-if="item">
      <div class="rounded-2xl bg-avocado-100 p-4 text-center space-y-1">
        <p class="text-sm text-muted">{{ item.name }}</p>
        <p class="text-xs text-muted">
          남은 금액
          <span class="font-semibold text-avocado-900">{{ formatCurrency(remainingAmount) }}</span>
        </p>
      </div>

      <div>
        <p class="text-sm font-medium text-avocado-900 mb-2">얼마를 저금할까요?</p>
        <input v-model="amountInput" type="number" inputmode="numeric" placeholder="금액을 입력해주세요"
          class="w-full border border-avocado-300 rounded-xl p-3 text-lg font-semibold outline-none" />
        <p v-if="errorMessage" class="text-sm text-red-500 mt-2">{{ errorMessage }}</p>
      </div>
    </div>

    <div class="p-4">
      <BaseButton variant="primary" class="w-full" :disabled="!canSubmit" @click="handleSubmit">
        {{ isSubmitting ? '저금하는 중...' : '저금하기' }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/common/AppHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'

import { depositToPiggyBank } from '@/api/piggy'
import { usePiggyBankStore } from '@/stores/piggyBank'
import { isValidAmount } from '@/utils/validators'
import { formatCurrency } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const store = usePiggyBankStore()

const piggyBankId = computed(() => route.params.id)

onMounted(() => {
  store.loadDetail(piggyBankId.value)
})

const item = computed(() => store.detail)

const remainingAmount = computed(() =>
  Math.max(0, Number(item.value?.targetAmount || 0) - Number(item.value?.savedAmount || 0))
)

const amountInput = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

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

    if (response.data.data.goalReached) {
      alert('목표 금액을 다 모았어요! 축하해요!')
    }

    router.replace({ name: 'piggyChildDetail', params: { id: piggyBankId.value } })
  } catch (e) {
    errorMessage.value = e.response?.data?.message || '저금에 실패했어요. 다시 시도해주세요.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
