<template>
  <div v-if="report" class="p-4 pb-8 flex flex-col gap-5">
    <!-- 아이 선택 -->
    <!-- TODO: 로그인/홈 화면 아이 선택 연동되면 이 드롭다운은 제거하고 홈에서 선택한 아이를 따라가도록 변경 -->
    <div class="rounded-2xl bg-white border border-gray-200 p-3 flex items-center gap-2 text-sm">
      <span class="font-medium text-gray-700">아이 선택</span>
      <select
        :value="childId"
        class="rounded-lg border border-gray-300 px-2 py-1 text-sm bg-white"
        @change="onChildChange"
      >
        <option :value="102">102 - 김지원</option>
        <option :value="103">103 - 김지호</option>
        <option :value="202">202 - 이유나</option>
      </select>
    </div>

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
          aria-label="이전 달"
          @click="goToMonth(-1)"
        >
          <ChevronLeft :size="20" />
        </button>

        <p class="text-base font-semibold text-gray-900">{{ monthLabel }}의 분석 결과</p>

        <button
          type="button"
          class="text-gray-400 disabled:opacity-30"
          :disabled="!report.navigation.hasNext"
          aria-label="다음 달"
          @click="goToMonth(1)"
        >
          <ChevronRight :size="20" />
        </button>
      </div>

      <!-- 소비 스타일 -->
      <div v-if="spendingType" class="flex flex-col items-center gap-5 text-center">
        <img :src="spendingTypeImage" alt="소비 유형" class="w-56 h-40 object-contain" />

        <p class="leading-snug">
          <span class="block text-xl font-bold text-gray-900"> 우리 아이의 {{ monthLabel }} </span>

          <span class="block text-2xl font-extrabold text-avocado-600 my-1">
            '{{ spendingType.name }}'
          </span>

          <span class="block text-xl font-bold text-gray-900"> 스타일이었어요! </span>
        </p>

        <!-- TODO(backend): 유형별 사용자 비율 통계 API 없음. 나오면 뱃지 복원 -->

        <p class="text-sm text-gray-900 text-center leading-relaxed px-2">
          *{{ spendingType.parentDescription }}
        </p>
      </div>
      <div v-else class="text-sm text-muted py-4">소비 유형을 불러오는 중...</div>
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

        지난달보다
        {{ Math.abs(report.summary.comparedToLastMonth).toLocaleString('ko-KR') }}원

        {{ report.summary.comparedToLastMonth <= 0 ? '더 아꼈어요!' : '더 썼어요' }}
      </p>

      <p class="text-sm mt-3">소비 건수 {{ report.summary.transactionCount }}건</p>
    </div>

    <!-- 지출 Top 5 -->
    <div class="rounded-3xl bg-white shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] p-5">
      <p class="text-base font-bold text-gray-900 mb-4">{{ monthLabel }} 지출 Top 5</p>

      <div class="flex flex-col gap-4">
        <div v-for="spot in coloredTopSpots" :key="spot.rank" class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between text-sm">
            <span class="flex items-center gap-1.5 text-gray-900">
              <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: spot.color }" />

              {{ spot.category }}
            </span>

            <span class="text-gray-900">
              {{ spot.percentage }}%

              <span class="text-muted"> ({{ spot.amount.toLocaleString('ko-KR') }}원) </span>
            </span>
          </div>

          <div class="h-2 rounded-full overflow-hidden" style="background-color: #eef0e7">
            <div
              class="h-full rounded-full"
              :style="{
                width: `${spot.percentage}%`,
                backgroundColor: spot.color
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 월별 소비 비교 -->
    <div class="rounded-3xl bg-avocado-100 p-5">
      <p class="text-base font-bold text-gray-900 mb-10">월별 소비 비교</p>

      <div class="flex items-end justify-around h-32">
        <div
          v-for="month in coloredMonthlyComparison"
          :key="month.yearMonth"
          class="flex flex-col items-center gap-2"
        >
          <span class="text-sm font-semibold" style="color: #4c6b3a">
            {{ month.amount.toLocaleString('ko-KR') }}원
          </span>

          <div
            class="w-9 rounded-full bg-white overflow-hidden flex items-end"
            style="height: 96px"
          >
            <div
              class="w-full rounded-full"
              :style="{
                height: `${barHeight(month.amount)}px`,
                backgroundColor: month.color
              }"
            />
          </div>

          <span class="text-sm" :style="{ color: month.color }">
            {{ month.month }}
          </span>
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

      <p class="text-sm mt-4 mb-2">
        이번 달 용돈 대비 저축률

        <span class="font-semibold text-progress-value">
          {{ report.savings.savingsRate != null ? `${report.savings.savingsRate}%` : '집계 중' }}
        </span>
      </p>

      <!-- 공통 프로그레스 바 색상 적용 -->
      <div class="h-2.5 rounded-full overflow-hidden bg-progress-track">
        <div
          class="h-full rounded-full bg-progress-value transition-[width] duration-300"
          :style="{
            width: `${getPercentage(report.savings.savingsRate)}%`
          }"
        />
      </div>
    </div>

    <!-- 아보카도 씨의 한마디 -->
    <!-- TODO(backend): AI 조언 API 아직 없음. 생기면 report.advice로 연결 -->
    <div
      v-if="report.advice"
      class="rounded-3xl shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] p-5 flex items-center gap-4"
      style="background-color: #f8dcae"
    >
      <img
        src="@/assets/images/ch3.png"
        alt="아보카도 캐릭터"
        class="w-32 h-40 object-contain shrink-0"
      />

      <div>
        <p class="text-sm font-bold text-avocado-600 mb-5">아보카도 씨의 한마디</p>

        <p class="text-sm text-gray-800 leading-relaxed">
          {{ report.advice }}
        </p>
      </div>
    </div>
  </div>

  <div v-else class="p-4 text-center text-sm py-10">불러오는 중...</div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Wallet, PiggyBank } from 'lucide-vue-next'
import { getReport, getSpendingType } from '@/api/report'
import ch3 from '@/assets/images/ch3.png'
import ch13 from '@/assets/images/ch13.png'
import ch14 from '@/assets/images/ch14.png'
import ch15 from '@/assets/images/ch15.png'
import ch16 from '@/assets/images/ch16.png'
import ch18 from '@/assets/images/ch18.png'
import ch19 from '@/assets/images/ch19.png'
import ch21 from '@/assets/images/ch21.png'
import ch23 from '@/assets/images/ch23.png'

const props = defineProps({
  childId: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()

const TOP_SPOT_COLORS = ['#3f6b22', '#78B159', '#f59e0b', '#b8d98c', '#d1d5db']
const MONTH_COLORS = ['#59B17F', '#9CB159', '#59A2B1']

const SPENDING_TYPE_IMAGES = {
  SAVING_DREAMER: ch13, // 꿈꾸는 꿈돌이
  ZERO_SPENDING: ch14, // 겨울잠 소비
  ONE_STORE_SNIPER: ch15, // 하나만 노리는 저격수
  BIG_SPENDER: ch16, // 큰 거 한방
  ROLLER_COASTER: ch18, // 롤러코스터 소비
  CAREFUL_OWL: ch19, // 생각하고 쓰는 부엉이
  SMALL_SAVER: ch21, // 티끌모아 부자
  FREQUENT_SPARROW: ch23, // 방앗간 못 지나가는 참새
  SPROUT: ch3 // 씨앗형
}

function getLastMonth() {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const currentYearMonth = ref(getLastMonth())
const report = ref(null)
const spendingType = ref(null)

const spendingTypeImage = computed(() => {
  return SPENDING_TYPE_IMAGES[spendingType.value?.code] ?? ch3
})

const monthLabel = computed(() => {
  if (!report.value) {
    return ''
  }

  const [, month] = report.value.yearMonth.split('-')

  return `${Number(month)}월`
})

const coloredTopSpots = computed(() => {
  if (!report.value) return []
  return report.value.topSpots.map((spot, index) => ({
    ...spot,
    color: TOP_SPOT_COLORS[index % TOP_SPOT_COLORS.length]
  }))
})

const coloredMonthlyComparison = computed(() => {
  if (!report.value) return []
  return report.value.monthlyComparison.map((month, index) => ({
    ...month,
    color: MONTH_COLORS[index % MONTH_COLORS.length]
  }))
})

function barHeight(amount) {
  if (!report.value) {
    return 0
  }

  const max = Math.max(...report.value.monthlyComparison.map((month) => month.amount))

  if (max <= 0) {
    return 16
  }

  return Math.max(16, (amount / max) * 96)
}

function getPercentage(value) {
  const percentage = Number(value ?? 0)

  return Math.min(100, Math.max(0, percentage))
}

async function fetchReport() {
  try {
    const { data } = await getReport(currentYearMonth.value, props.childId)
    report.value = data.data
  } catch (error) {
    console.error('리포트 조회 실패:', error)
  }
}

async function fetchSpendingType() {
  try {
    const { data } = await getSpendingType(currentYearMonth.value, props.childId)
    spendingType.value = data.data
  } catch (error) {
    console.error('소비 유형 조회 실패:', error)
  }
}

function goToMonth(diff) {
  const [year, month] = currentYearMonth.value.split('-').map(Number)

  const date = new Date(year, month - 1 + diff, 1)

  currentYearMonth.value =
    `${date.getFullYear()}-` + `${String(date.getMonth() + 1).padStart(2, '0')}`

  // 새 데이터 도착 전까지 이전 값을 그대로 보여줘서 로딩 중 깜빡임을 없앰
  fetchReport()
  fetchSpendingType()
}

function onChildChange(event) {
  router.push({ name: 'parent-report', params: { childId: event.target.value } })
}

// childId가 URL 파라미터라 라우트가 바뀔 때(드롭다운 선택 시) 다시 불러와야 함
watch(
  () => props.childId,
  () => {
    fetchReport()
    fetchSpendingType()
  }
)

onMounted(() => {
  fetchReport()
  fetchSpendingType()
})
</script>
