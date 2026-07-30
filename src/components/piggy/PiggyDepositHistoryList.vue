<template>
    <div class="rounded-2xl border border-avocado-100 shadow-sm p-4">
        <p v-if="deposits.length === 0" class="text-sm text-muted text-center py-6">
            아직 입금 내역이 없어요.
        </p>
        <div v-else class="divide-y divide-avocado-100">
            <div v-for="deposit in deposits" :key="deposit.depositId"
                class="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <p class="text-sm text-muted">{{ formatDate(deposit.depositedAt) }}</p>
                <div class="text-right">
                    <p class="text-base font-semibold text-avocado-600">+{{ formatWon(deposit.amount) }}</p>
                    <p class="text-xs text-muted">{{ formatWon(deposit.balanceAfter) }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

/* piggy.js의 조회 함수 */
import { getDeposits } from '@/api/piggy'

/* 부모에서 id 값 가져옴 */
const props = defineProps({
    piggyBankId: {
        type: [String, Number],
        required: true
    }
})

/* 테스트 데이터 */
const deposits = ref([
    { depositId: 3, amount: 10000, balanceAfter: 45000, depositedAt: '2026-07-27T10:00:00' },
    { depositId: 2, amount: 10000, balanceAfter: 35000, depositedAt: '2026-07-26T10:00:00' },
    { depositId: 1, amount: 10000, balanceAfter: 25000, depositedAt: '2026-07-25T10:00:00' }
])

/* 날짜를 00.00 형태로 변환 */
function formatDate(dateString) {
    const date = new Date(dateString)
    return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

/* 원화 포맷 */
function formatWon(amount) {
    return `${Number(amount).toLocaleString('ko-KR')}원`
}
</script>