<template>
  <div
    class="mx-2 rounded-2xl bg-white border border-[#E8EDE4] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] p-4"
  >
    <p v-if="deposits.length === 0" class="text-sm text-muted text-center py-6">
      아직 저금한 기록이 없어요.
    </p>

    <template v-else>
      <div>
        <div
          v-for="(deposit, index) in visibleDeposits"
          :key="deposit.depositId"
          class="flex items-start justify-between py-5 first:pt-0 last:pb-0"
        >
          <div class="flex gap-3">
            <p class="w-9 shrink-0 text-xs text-muted">
              {{
                isSameDateAsPrev(visibleDeposits, index) ? '' : formatMonthDay(deposit.depositedAt)
              }}
            </p>
            <div>
              <p class="text-sm font-bold text-gray-600">내 아보카도 지갑</p>
              <p class="text-[11px] text-muted mt-0.5">{{ formatTime(deposit.depositedAt) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-base font-semibold text-avocado-600">+{{ formatWon(deposit.amount) }}</p>
            <p class="text-xs text-muted">{{ formatWon(deposit.balanceAfter) }}</p>
          </div>
        </div>
      </div>

      <RouterLink
        v-if="deposits.length > VISIBLE_COUNT"
        :to="historyRoute"
        class="block w-full mt-2 pt-3 border-t border-avocado-100 text-sm text-muted text-center"
      >
        모두 보기 ({{ deposits.length }})
      </RouterLink>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

/* piggy.js의 조회 함수 */
import { getDeposits } from '@/api/piggy'

/* 부모에서 id 값 가져옴 */
const props = defineProps({
  piggyBankId: {
    type: [String, Number],
    required: true
  },
  // 부모 화면에서만 넘어온다. 있으면 부모용 전체보기 라우트로, 없으면 아이용 라우트로 이동한다.
  childId: {
    type: [String, Number],
    default: null
  }
})

// 이 화면에서는 최근 3개까지만 요약해서 보여주고, 그 이상은 "모두 보기"에서 확인한다.
const VISIBLE_COUNT = 3

const deposits = ref([])

const visibleDeposits = computed(() => deposits.value.slice(0, VISIBLE_COUNT))

const historyRoute = computed(() =>
  props.childId != null
    ? {
        name: 'parentPiggyDepositHistory',
        params: { childId: props.childId, id: props.piggyBankId }
      }
    : { name: 'piggyDepositHistory', params: { id: props.piggyBankId } }
)

async function fetchDeposits() {
  try {
    const response = await getDeposits(props.piggyBankId, props.childId)
    deposits.value = response.data.data
  } catch (e) {
    deposits.value = []
  }
}

watch(() => props.piggyBankId, fetchDeposits, { immediate: true })

/* 바로 이전 항목과 날짜(월.일)가 같은지 확인 */
function isSameDateAsPrev(list, index) {
  if (index === 0) return false
  return formatMonthDay(list[index].depositedAt) === formatMonthDay(list[index - 1].depositedAt)
}

/* 날짜를 0.0 형태로 변환 (월.일) */
function formatMonthDay(dateString) {
  const date = new Date(dateString)
  return `${date.getMonth() + 1}.${date.getDate()}`
}

/* 시간을 00:00 형태로 변환 */
function formatTime(dateString) {
  const date = new Date(dateString)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/* 원화 포맷 */
function formatWon(amount) {
  return `${Number(amount).toLocaleString('ko-KR')}원`
}
</script>
