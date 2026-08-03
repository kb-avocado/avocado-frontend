<template>
  <div v-if="report" class="p-4 pb-8 flex flex-col gap-5">
    <!-- 분석 결과 카드 (네비게이션 + 소비 스타일) -->
    <div
      class="rounded-3xl bg-white shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] px-5 py-6 flex flex-col items-center gap-5"
    >
      <!-- 월 네비게이션 -->
      <div class="flex items-center justify-center gap-3">
        <button
          type="button"
          class="text-gray-400 disabled:opacity-30"
          :disabled="!report.navigation.hasPrevious"
          @click="goToMonth(-1)"
        >
          <ChevronLeft :size="20" />
        </button>
        <p class="text-base font-semibold text-gray-900">{{ monthLabel }}의 분석 결과</p>
        <button
          type="button"
          class="text-gray-400 disabled:opacity-30"
          :disabled="!report.navigation.hasNext"
          @click="goToMonth(1)"
        >
          <ChevronRight :size="20" />
        </button>
      </div>

      <!-- 소비 스타일 -->
      <div class="flex flex-col items-center gap-5 text-center">
        <img
          src="@/assets/images/ch2.png"
          alt="방앗간 못 지나가는 참새"
          class="w-56 h-40 object-contain"
        />

        <p class="leading-snug">
          <span class="block text-xl font-bold text-gray-900"> 지우는 {{ monthLabel }} </span>
          <span class="block text-2xl font-extrabold text-avocado-600 my-1">
            '{{ report.style.title }}'
          </span>
          <span class="block text-xl font-bold text-gray-900"> 스타일이었어요! </span>
        </p>

        <span
          class="inline-block bg-avocado-100 text-avocado-600 font-bold text-base px-6 py-3 rounded-full"
        >
          아보카도 사용자 중 {{ report.style.userPercentage }}%가 이 유형이에요
        </span>

        <p class="text-sm text-gray-900 text-center leading-relaxed px-2">
          <template v-if="isParentView">*{{ report.style.parentDescription }}</template>
          <template v-else>{{ report.style.childDescription }}</template>
        </p>
      </div>
    </div>

    <!-- 이번 달 소비 금액 -->
    <div class="rounded-3xl bg-avocado-100 shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] p-5">
      <div class="flex items-center justify-between">
        <p class="text-sm">{{ monthLabel }} 소비 금액</p>
        <span class="w-9 h-9 rounded-full bg-white flex items-center justify-center">
          <Wallet :size="16" class="text-avocado-600" />
        </span>
      </div>
      <p class="text-3xl font-bold text-gray-900 mt-1">
        {{ report.summary.totalSpent.toLocaleString('ko-KR') }}원
      </p>
      <p
        class="text-sm font-medium mt-2 flex items-center gap-1"
        :class="report.summary.comparedToLastMonth <= 0 ? 'text-avocado-600' : 'text-red-500'"
      >
        {{ report.summary.comparedToLastMonth <= 0 ? '↘' : '↗' }}
        지난달보다 {{ Math.abs(report.summary.comparedToLastMonth).toLocaleString('ko-KR') }}원
        {{ report.summary.comparedToLastMonth <= 0 ? '더 아꼈어요!' : '더 썼어요' }}
      </p>
      <p class="text-sm mt-3">소비 건수 {{ report.summary.transactionCount }}건</p>
    </div>

    <!-- 지출 Top 5 -->
    <div class="rounded-3xl bg-white shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] p-5">
      <p class="text-base font-bold text-gray-900 mb-4">{{ monthLabel }} 지출 Top 5</p>
      <div class="flex flex-col gap-4">
        <div v-for="spot in report.topSpots" :key="spot.rank" class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between text-sm">
            <span class="flex items-center gap-1.5 text-gray-900">
              <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: spot.color }" />
              {{ spot.category }}
            </span>
            <span class="text-gray-900">
              {{ spot.percentage }}%
              <span class="text-muted">({{ spot.amount.toLocaleString('ko-KR') }}원)</span>
            </span>
          </div>
          <div class="h-2 rounded-full" style="background-color: #f0e6d2">
            <div
              class="h-2 rounded-full"
              :style="{ width: spot.percentage + '%', backgroundColor: spot.color }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 월별 소비 비교 -->
    <div class="rounded-3xl p-5" style="background-color: #ebf4dd">
      <p class="text-base font-bold text-gray-900 mb-10">월별 소비 비교</p>
      <div class="flex items-end justify-around h-32">
        <div
          v-for="m in report.monthlyComparison"
          :key="m.month"
          class="flex flex-col items-center gap-2"
        >
          <span class="text-sm font-semibold" style="color: #4c6b3a">
            {{ m.amount.toLocaleString('ko-KR') }}원
          </span>
          <div
            class="w-9 rounded-full bg-white overflow-hidden flex items-end"
            style="height: 96px"
          >
            <div
              class="w-full rounded-full"
              :style="{ height: barHeight(m.amount) + 'px', backgroundColor: m.color }"
            />
          </div>
          <span class="text-sm" :style="{ color: m.color }">{{ m.month }}</span>
        </div>
      </div>
    </div>

    <!-- 이번 달 저축 현황 -->
    <div class="rounded-3xl bg-white shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] p-5">
      <div class="flex items-center justify-between mb-7">
        <p class="text-sm">이번 달 저축 현황</p>
        <PiggyBank :size="18" class="text-avocado-600" />
      </div>
      <p class="text-2xl font-bold text-gray-900 mt-0.5">
        {{ report.savings.totalSaved.toLocaleString('ko-KR') }}원 저금했어요!
      </p>
      <p class="text-sm mt-4 mb-1.5">이번 달 용돈 대비 저축률 {{ report.savings.savingsRate }}%</p>
      <div class="h-2.5 rounded-full" style="background-color: #f0e6d2">
        <div
          class="h-2.5 rounded-full bg-avocado-600"
          :style="{ width: report.savings.savingsRate + '%' }"
        />
      </div>
    </div>

    <!-- 아보카도씨의 한마디 -->
    <div
      class="rounded-3xl shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] p-5 flex items-center gap-4"
      style="background-color: #f8dcae"
    >
      <img src="@/assets/images/ch3.png" alt="" class="w-32 h-40 object-contain shrink-0" />
      <div>
        <p class="text-sm font-bold text-avocado-600 mb-5">아보카도 씨의 한마디</p>
        <p class="text-sm text-gray-800 leading-relaxed">{{ report.advice }}</p>
      </div>
    </div>
  </div>

  <div v-else class="p-4 text-center text-sm py-10">불러오는 중...</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ChevronLeft, ChevronRight, Wallet, PiggyBank } from 'lucide-vue-next'
// TODO(mock): 백엔드 붙으면 아래 주석 풀고 mock 코드 지우기
// import { getReport } from '@/api/report'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
// TODO: 로그인 붙으면 authStore.user.role === 'PARENT'로 정확히 판단
const isParentView = computed(() => authStore.user?.role === 'PARENT')

const currentYearMonth = ref('2026-06')
const report = ref(null)

const monthLabel = computed(() => {
  if (!report.value) return ''
  const [, month] = report.value.yearMonth.split('-')
  return `${Number(month)}월`
})

function barHeight(amount) {
  if (!report.value) return 0
  const max = Math.max(...report.value.monthlyComparison.map((m) => m.amount))
  return Math.max(16, (amount / max) * 96)
}

// TODO(mock): 백엔드 붙으면 이 목업 데이터 삭제
function buildMockReport(yearMonth) {
  return {
    yearMonth,
    style: {
      type: 'SPARROW',
      title: '방앗간 못 지나가는 참새',
      childDescription: '용돈 쓰는 날이 많았어요! 다음 달엔 하루쯤 쉬어가는 소비도 도전해 보세요.',
      parentDescription:
        '방앗간 못 지나가는 참새는 한 달 중 용돈을 소비한 날이 25일 이상일 때 나오는 유형이에요',
      userPercentage: 12
    },
    summary: {
      totalSpent: 42500,
      comparedToLastMonth: -5000,
      transactionCount: 18
    },
    topSpots: [
      { rank: 1, category: '다이소', amount: 19125, percentage: 45, color: '#3f6b22' },
      { rank: 2, category: '아맛나 떡볶이집', amount: 12750, percentage: 30, color: '#78B159' },
      { rank: 3, category: 'GS25', amount: 6375, percentage: 15, color: '#f59e0b' },
      { rank: 4, category: '와와 피시방', amount: 2550, percentage: 6, color: '#b8d98c' },
      { rank: 5, category: '기타', amount: 1700, percentage: 4, color: '#d1d5db' }
    ],
    monthlyComparison: [
      { month: '4월', amount: 20000, color: '#59B17F' },
      { month: '5월', amount: 28000, color: '#9CB159' },
      { month: '6월', amount: 23000, color: '#59A2B1' }
    ],
    savings: {
      totalSaved: 25000,
      savingsRate: 50
    },
    advice:
      '아보카도 씨의 한마디, 아이에게 이번 주에 먹은 간식 중 어떤 게 가장 뿌듯했는지 물어보며 칭찬해 주세요.',
    navigation: { hasPrevious: true, hasNext: true }
  }
}

async function fetchReport() {
  // TODO(mock): 백엔드 붙으면 아래로 교체
  // const { data } = await getReport(currentYearMonth.value)
  // report.value = data
  report.value = buildMockReport(currentYearMonth.value)
}

function goToMonth(diff) {
  const [year, month] = currentYearMonth.value.split('-').map(Number)
  const date = new Date(year, month - 1 + diff, 1)
  currentYearMonth.value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  fetchReport()
}

onMounted(fetchReport)
</script>
