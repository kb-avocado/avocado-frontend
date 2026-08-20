<template>
  <div class="h-screen overflow-hidden flex flex-col bg-white">
    <AppHeader
      title="입금 내역"
      show-back
      :show-bell="false"
      :show-avatar="false"
      @click-back="router.back()"
    />

    <div class="flex-1 min-h-0 overflow-y-auto p-4">
      <p v-if="deposits.length === 0" class="text-sm text-muted text-center py-10">
        아직 입금 내역이 없어요.
      </p>

      <div
        v-else
        class="mx-2 rounded-2xl bg-white border border-[#E8EDE4] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] p-4"
      >
        <div
          v-for="(deposit, index) in deposits"
          :key="deposit.depositId"
          class="flex items-start justify-between py-5 first:pt-0 last:pb-0"
        >
          <div class="flex gap-3">
            <p class="w-9 shrink-0 text-xs text-muted">
              {{ isSameDateAsPrev(deposits, index) ? '' : formatMonthDay(deposit.depositedAt) }}
            </p>
            <div>
              <p class="text-base font-bold text-gray-600">내 아보카도 지갑</p>
              <p class="text-xs text-muted mt-0.5">{{ formatTime(deposit.depositedAt) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-base font-semibold text-avocado-600">+{{ formatWon(deposit.amount) }}</p>
            <p class="text-xs text-muted">{{ formatWon(deposit.balanceAfter) }}</p>
          </div>
        </div>
      </div>

      <div v-if="deposits.length > 0" class="mx-2 mt-6 flex justify-center">
        <button
          type="button"
          class="flex h-11 w-40 items-center justify-center rounded-full bg-gray-400 text-sm font-medium text-white hover:bg-gray-500"
          @click="router.back()"
        >
          돌아가기
        </button>
      </div>
    </div>

    <BottomNavBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/common/AppHeader.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import { getDeposits } from '@/api/piggy'

const route = useRoute()
const router = useRouter()

const deposits = ref([])

onMounted(async () => {
  try {
    const response = await getDeposits(route.params.id, route.params.childId)
    deposits.value = response.data.data
  } catch (e) {
    deposits.value = []
  }
})

function isSameDateAsPrev(list, index) {
  if (index === 0) return false
  return formatMonthDay(list[index].depositedAt) === formatMonthDay(list[index - 1].depositedAt)
}

function formatMonthDay(dateString) {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}.${date.getDate()}`
}

function formatTime(dateString) {
  const date = new Date(dateString)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatWon(amount) {
  return `${Number(amount).toLocaleString('ko-KR')}원`
}
</script>
