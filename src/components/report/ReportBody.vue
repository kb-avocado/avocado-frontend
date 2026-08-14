<template>
  <div class="flex flex-col gap-5 overflow-x-hidden">
    <!-- 월 네비게이션 -->
    <div class="flex items-center justify-center gap-3">
      <button
        type="button"
        class="text-gray-400 disabled:opacity-30"
        :disabled="!report.navigation.hasPrevious"
        aria-label="이전 달"
        @click="$emit('prev-month')"
      >
        <ChevronLeft :size="20" />
      </button>

      <p class="text-base font-semibold text-gray-900">{{ monthLabel }}의 분석 결과</p>

      <button
        type="button"
        class="text-gray-400 disabled:opacity-30"
        :disabled="!report.navigation.hasNext"
        aria-label="다음 달"
        @click="$emit('next-month')"
      >
        <ChevronRight :size="20" />
      </button>
    </div>

    <!-- 소비 스타일 카드 -->
    <div
      class="rounded-2xl bg-white border border-[#E8EDE4] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] px-5 py-6 flex flex-col items-center gap-5"
    >
      <!-- 소비 스타일 -->
      <div v-if="spendingType" class="flex flex-col items-center gap-5 text-center">
        <img :src="spendingTypeImage" alt="소비 유형" class="w-56 h-40 object-contain" />

        <p class="leading-snug">
          <span class="block text-xl font-bold text-gray-900">{{ subjectLabel }} 유형은</span>

          <span class="block text-2xl font-extrabold text-avocado-600 my-1">
            '{{ spendingType.name }}'
          </span>

          <span class="block text-xl font-bold text-gray-900"> 이었어요! </span>
        </p>

        <!-- 같은 달, 같은 유형 비율 -->
        <span
          v-if="spendingType.percentage != null"
          class="inline-block bg-gray-100 text-gray-500 text-xs font-semibold px-4 py-2 rounded-full"
        >
          아보카도 사용 어린이 중 {{ spendingType.percentage }}%가 같은 유형이에요
        </span>
        <!-- "왜 이런 유형이 나왔나요?" 트리거 + 팝오버 -->
        <div ref="popoverWrapperRef" class="relative">
          <button
            type="button"
            class="text-sm underline underline-offset-2"
            style="color: #9aa090"
            @click="showTypeInfo = !showTypeInfo"
          >
            Q. 왜 이런 유형이 나왔나요?
          </button>
          <Transition name="popover">
            <div
              v-if="showTypeInfo"
              class="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-2xl bg-white shadow-[0px_8px_24px_0px_rgba(0,0,0,0.15)] p-5 text-left"
            >
              <button
                type="button"
                class="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                aria-label="닫기"
                @click="showTypeInfo = false"
              >
                <X :size="16" />
              </button>

              <p class="flex items-center gap-1.5 text-sm font-bold mb-3" style="color: #5284a5">
                <Search :size="16" />
                왜 이런 유형이 나왔나요?
              </p>

              <p class="text-sm text-gray-900 leading-relaxed">
                <span class="font-bold">"{{ spendingType.name }}"</span> 유형은
                {{ spendingType.parentDescription }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
      <div v-else class="text-sm text-muted py-4">소비 유형을 불러오는 중...</div>
    </div>

    <!-- 소비 금액 / 지출 Top 3 / 월별 소비 비교 : 슬라이드 카드 -->
    <div class="rounded-3xl shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] overflow-hidden">
      <div class="overflow-hidden">
        <div
          class="flex transition-transform duration-300 ease-out"
          :style="{ transform: `translateX(-${activeSlide * 100}%)` }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <!-- 슬라이드 1: 이번 달 소비 금액 -->
          <div class="w-full shrink-0 p-5" style="background-color: #fff8f5">
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

          <!-- 슬라이드 2: 지출 Top 3 -->
          <div class="w-full shrink-0 p-5" style="background-color: #f5faff">
            <p class="text-base font-bold text-gray-900 mb-4">{{ monthLabel }} 지출 Top 3</p>

            <div class="flex flex-col gap-4">
              <div v-for="spot in coloredTopSpots" :key="spot.rank" class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between text-sm">
                  <span class="flex items-center gap-1.5 text-gray-900">
                    <span
                      class="w-2.5 h-2.5 rounded-full"
                      :style="{ backgroundColor: spot.color }"
                    />

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

          <!-- 슬라이드 3: 월별 소비 비교 (선 그래프) -->
          <div class="w-full shrink-0 p-5" style="background-color: #f7f5ff">
            <p class="text-base font-bold text-gray-900 mb-4">월별 소비 비교</p>

            <svg viewBox="0 0 300 100" class="w-full h-28">
              <polyline
                :points="chartPolylinePoints"
                fill="none"
                stroke="#B49DDB"
                stroke-width="2"
              />

              <g v-for="(point, index) in chartPoints" :key="point.yearMonth">
                <circle
                  :cx="point.x"
                  :cy="point.y"
                  r="4"
                  :fill="index === chartPoints.length - 1 ? '#8B6FB8' : '#D6C7EC'"
                />
                <text
                  :x="point.x"
                  :y="point.y - 10"
                  text-anchor="middle"
                  font-size="11"
                  font-weight="600"
                  fill="#8B6FB8"
                >
                  {{ point.amount.toLocaleString('ko-KR') }}
                </text>
                <text
                  :x="point.x"
                  y="96"
                  text-anchor="middle"
                  font-size="11"
                  :fill="index === chartPoints.length - 1 ? '#374151' : '#B49DDB'"
                  :font-weight="index === chartPoints.length - 1 ? '700' : '400'"
                >
                  {{ point.month }}
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <!-- 슬라이드 인디케이터 -->
      <div class="flex items-center justify-center gap-1.5 py-4">
        <button
          v-for="i in 3"
          :key="i"
          type="button"
          class="h-1.5 rounded-full transition-all"
          :class="activeSlide === i - 1 ? 'w-4 bg-avocado-600' : 'w-1.5 bg-gray-300'"
          :aria-label="`${i}번째 카드로 이동`"
          @click="goToSlide(i - 1)"
        />
      </div>
    </div>

    <!-- 이번 달 저축 현황 -->
    <div class="rounded-3xl p-5" style="background-color: #ebf4dd">
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm" style="color: #1d1b16">이번 달 저축 현황</p>

        <PiggyBank :size="18" style="color: #34a873" />
      </div>

      <p class="text-sm" style="color: #9aa090">이번 달 후 저금액</p>

      <p class="text-2xl font-bold mt-1" style="color: #1d1b16">
        {{ report.savings.totalSaved.toLocaleString('ko-KR') }}원
      </p>
      <p class="text-sm mt-1" style="color: #34a873">저금했어요!</p>

      <div class="flex items-center justify-between mt-4 mb-2">
        <p class="text-sm" style="color: #1d1b16">이번 달 용돈 대비 저축률</p>

        <span class="text-sm font-semibold" style="color: #34a873">
          {{ report.savings.savingsRate != null ? `${report.savings.savingsRate}%` : '집계 중' }}
        </span>
      </div>

      <div class="h-2.5 rounded-full overflow-hidden" style="background-color: #f3f4f6">
        <div
          class="h-full rounded-full transition-[width] duration-300"
          :style="{
            backgroundColor: '#96d394',
            width: `${getPercentage(report.savings.savingsRate)}%`
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, Wallet, PiggyBank, Search, X } from 'lucide-vue-next'

const props = defineProps({
  report: {
    type: Object,
    required: true
  },
  spendingType: {
    type: Object,
    default: null
  },
  spendingTypeImage: {
    type: String,
    default: ''
  },
  // "나의" (아이용) / "OO의" (부모용)처럼, "{subjectLabel} 유형은 '...' 이었어요!" 문장에 들어갈 말
  subjectLabel: {
    type: String,
    required: true
  },
  // "전체 {peerLabel} 중 N%가 같은 유형이에요" — 아이용은 "친구", 부모용은 "아이"
  peerLabel: {
    type: String,
    default: '친구'
  }
})

defineEmits(['prev-month', 'next-month'])

const TOP_SPOT_COLORS = ['#FF8C69', '#7BC8F5', '#B49DDB']
const TOP_SPOTS_DISPLAY_COUNT = 3
const SLIDE_COUNT = 3
const SWIPE_THRESHOLD = 40

// "왜 이런 유형이 나왔나요?" 팝오버 상태
const showTypeInfo = ref(false)
const popoverWrapperRef = ref(null)

function onDocumentClick(event) {
  if (popoverWrapperRef.value && !popoverWrapperRef.value.contains(event.target)) {
    showTypeInfo.value = false
  }
}

watch(showTypeInfo, (isOpen) => {
  if (isOpen) {
    document.addEventListener('click', onDocumentClick)
  } else {
    document.removeEventListener('click', onDocumentClick)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})

// 소비금액/지출Top3/월별비교 슬라이드 카드 상태 (네이티브 스크롤 대신 transform 방식)
const activeSlide = ref(0)
let touchStartX = 0
let touchDeltaX = 0

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
  touchDeltaX = 0
}

function onTouchMove(e) {
  touchDeltaX = e.touches[0].clientX - touchStartX
}

function onTouchEnd() {
  if (touchDeltaX < -SWIPE_THRESHOLD && activeSlide.value < SLIDE_COUNT - 1) {
    activeSlide.value += 1
  } else if (touchDeltaX > SWIPE_THRESHOLD && activeSlide.value > 0) {
    activeSlide.value -= 1
  }
  touchDeltaX = 0
}

function goToSlide(index) {
  activeSlide.value = index
}

const monthLabel = computed(() => {
  if (!props.report) return ''
  const [, month] = props.report.yearMonth.split('-')
  return `${Number(month)}월`
})

const coloredTopSpots = computed(() => {
  if (!props.report) return []
  return props.report.topSpots.slice(0, TOP_SPOTS_DISPLAY_COUNT).map((spot, index) => ({
    ...spot,
    color: TOP_SPOT_COLORS[index % TOP_SPOT_COLORS.length]
  }))
})

// 월별 소비 비교 선 그래프용 좌표 계산 (viewBox: 0 0 300 100)
const chartPoints = computed(() => {
  if (!props.report || props.report.monthlyComparison.length === 0) return []

  const values = props.report.monthlyComparison.map((m) => m.amount)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1

  const width = 260
  const leftPad = 20
  const chartHeight = 55
  const topPad = 22
  const count = props.report.monthlyComparison.length
  const step = count > 1 ? width / (count - 1) : 0

  return props.report.monthlyComparison.map((m, index) => ({
    x: leftPad + index * step,
    y: topPad + chartHeight - ((m.amount - min) / range) * chartHeight,
    amount: m.amount,
    month: m.month,
    yearMonth: m.yearMonth
  }))
})

const chartPolylinePoints = computed(() => chartPoints.value.map((p) => `${p.x},${p.y}`).join(' '))

function getPercentage(value) {
  const percentage = Number(value ?? 0)
  return Math.min(100, Math.max(0, percentage))
}
</script>

<style scoped>
.popover-enter-active,
.popover-leave-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s ease;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
