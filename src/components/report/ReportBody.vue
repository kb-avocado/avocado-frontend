<template>
  <div class="flex flex-col gap-8 overflow-x-hidden">
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

    <!-- 소비 금액 / 지출 Top 3 / 이번 달 저금액 : 슬라이드 카드 -->
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
          <div
            class="relative w-full shrink-0 flex flex-col gap-5 py-6 px-5"
            style="background-color: #fff8f5; border-radius: 16px"
          >
            <div>
              <p class="text-sm" style="color: #9aa090">{{ monthLabel }} 소비 금액</p>
              <p class="text-3xl font-bold mt-1" style="color: #1d1b16">
                {{ animatedTotalSpent.toLocaleString('ko-KR') }}원
              </p>
            </div>

            <p
              class="text-sm font-medium w-fit flex items-center gap-1 px-3 py-1.5 rounded-full"
              style="color: #ff8c69; background-color: #ffe4d9"
            >
              {{ report.summary.comparedToLastMonth <= 0 ? '▼' : '▲' }}
              지난달 대비
              {{ Math.abs(report.summary.comparedToLastMonth).toLocaleString('ko-KR') }}원
            </p>

            <div
              class="flex items-center justify-between pt-4"
              style="border-top: 1px solid #f3e2d8"
            >
              <p class="text-sm" style="color: #9aa090">소비 건수</p>
              <p class="text-lg font-bold" style="color: #1d1b16">
                {{ report.summary.transactionCount }}건
              </p>
            </div>
          </div>

          <!-- 슬라이드 2: 지출 Top 3 -->
          <div class="w-full shrink-0 p-5" style="background-color: #f5faff">
            <p class="text-base font-bold mb-4" style="color: #1d1b16">
              {{ monthLabel }} 지출 Top 3
            </p>

            <div class="flex flex-col gap-4">
              <div v-for="spot in coloredTopSpots" :key="spot.rank" class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between text-sm">
                  <span class="flex items-center gap-1.5" style="color: #1d1b16">
                    <span
                      class="w-2.5 h-2.5 rounded-full"
                      :style="{ backgroundColor: spot.color }"
                    />

                    {{ spot.category }}
                  </span>

                  <span style="color: #1d1b16">
                    <span class="font-bold">{{ spot.percentage }}%</span>

                    <span style="color: #9aa090">
                      ({{ spot.amount.toLocaleString('ko-KR') }}원)
                    </span>
                  </span>
                </div>

                <div class="h-2 rounded-full overflow-hidden" style="background-color: #ebebeb">
                  <div
                    class="h-full rounded-full transition-[width] duration-700 ease-out"
                    :style="{
                      width: barsVisible ? `${spot.percentage}%` : '0%',
                      backgroundColor: spot.color
                    }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 슬라이드 3: 이번 달 저금액 -->
          <div class="w-full shrink-0 p-5" style="background-color: #fdf3d1">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm" style="color: #9aa090">이번 달 저금액</p>
                <p class="text-3xl font-bold mt-1" style="color: #1d1b16">
                  {{ animatedTotalSaved.toLocaleString('ko-KR') }}원
                </p>
                <p class="text-sm mt-1" style="color: #e0a800">저금했어요!</p>
              </div>
              <img
                :src="piggyImage"
                alt="저금통"
                class="w-32 h-32 object-contain shrink-0 pointer-events-none mr-4"
              />
            </div>

            <div class="flex items-center justify-between mt-4 mb-2">
              <p class="text-sm" style="color: #9aa090">이번 달 용돈 대비 저축률</p>

              <span class="text-sm font-semibold" style="color: #e0a800">
                {{
                  report.savings.savingsRate != null ? `${report.savings.savingsRate}%` : '집계 중'
                }}
              </span>
            </div>

            <div class="h-4 rounded-full overflow-hidden" style="background-color: #f3f4f6">
              <div
                class="h-full rounded-full transition-[width] duration-700 ease-out"
                :style="{
                  backgroundColor: '#f5c518',
                  width: barsVisible ? `${getPercentage(report.savings.savingsRate)}%` : '0%'
                }"
              />
            </div>
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
          :class="activeSlide === i - 1 ? 'w-4' : 'w-1.5'"
          :style="{ backgroundColor: activeSlide === i - 1 ? '#5E5F5E' : '#B5B5B5' }"
          :aria-label="`${i}번째 카드로 이동`"
          @click="goToSlide(i - 1)"
        />
      </div>
    </div>

    <!-- 월별 소비 비교 (선 그래프) -->
    <div
      class="rounded-2xl flex flex-col"
      style="background-color: #f7f5ff; padding: 24px 20px; gap: 16px; min-height: 236px"
    >
      <p class="text-base font-bold" style="color: #1d1b16">월별 소비 비교</p>

      <svg viewBox="0 0 300 130" class="w-full h-36">
        <polyline
          ref="polylineRef"
          :points="chartPolylinePoints"
          fill="none"
          stroke="#B49DDB"
          stroke-width="2"
          :style="{
            strokeDasharray: chartPathLength,
            strokeDashoffset: chartRevealed ? 0 : chartPathLength,
            transition: 'stroke-dashoffset 0.8s ease-out'
          }"
        />

        <g
          v-for="(point, index) in chartPoints"
          :key="point.yearMonth"
          :style="{
            opacity: chartRevealed ? 1 : 0,
            transition: `opacity 0.4s ease-out ${0.3 + index * 0.15}s`
          }"
        >
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
            y="124"
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

    <!-- 아보카도 씨의 한마디 -->
    <div class="flex items-end gap-1">
      <img
        :src="cadoseedImage"
        alt="아보카도 씨"
        class="w-32 h-32 object-contain shrink-0 pointer-events-none"
      />

      <!-- 칠판: 높이를 고정하고, 이미지는 배경처럼 덮어서 텍스트가 항상 안전하게 들어가도록 함 -->
      <div class="relative flex-1 rounded-2xl overflow-hidden" style="min-height: 168px">
        <img
          :src="boardImage"
          alt="칠판"
          class="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        <div
          class="relative flex h-full flex-col justify-center gap-1.5 text-white"
          style="min-height: 168px; padding: 12px 16px 12px 56px"
        >
          <p class="text-sm font-bold">아보카도 씨의 한마디</p>
          <p class="text-xs leading-relaxed">
            "아이에게 이번 주에 먹은 간식 중 어떤 게 가장 행복했는지 물어보며 칭찬해 주세요."
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-vue-next'
import piggyImage from '@/assets/images/piggypiggy.png'
import cadoseedImage from '@/assets/images/cadoseed.png'
import boardImage from '@/assets/images/board.png'

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

const TOP_SPOT_COLORS = ['#FF8C69', '#7BC8F5', '#B39DDB']
const TOP_SPOTS_DISPLAY_COUNT = 3
const SLIDE_COUNT = 3
const SWIPE_THRESHOLD = 40
const NUMBER_ANIMATION_DURATION = 800

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
  if (numberAnimationFrame) cancelAnimationFrame(numberAnimationFrame)
})

// 소비금액/지출Top3/저금액 슬라이드 카드 상태 (네이티브 스크롤 대신 transform 방식)
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

// 월별 소비 비교 선 그래프용 좌표 계산 (viewBox: 0 0 300 130)
const chartPoints = computed(() => {
  if (!props.report || props.report.monthlyComparison.length === 0) return []

  const values = props.report.monthlyComparison.map((m) => m.amount)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1

  const width = 260
  const leftPad = 20
  const chartHeight = 80
  const topPad = 24
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

// ── 조회할 때마다 수치가 "슈욱" 올라가는 연출 ──────────────────
const animatedTotalSpent = ref(0)
const animatedTotalSaved = ref(0)
const barsVisible = ref(false)
const chartRevealed = ref(false)
const chartPathLength = ref(0)
const polylineRef = ref(null)

let numberAnimationFrame = null

function animateNumberTo(setter, from, to, duration = NUMBER_ANIMATION_DURATION) {
  const startTime = performance.now()
  const diff = to - from

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // ease-out-cubic
    setter(Math.round(from + diff * eased))
    if (progress < 1) {
      numberAnimationFrame = requestAnimationFrame(tick)
    }
  }

  numberAnimationFrame = requestAnimationFrame(tick)
}

function updateChartPathLength() {
  if (polylineRef.value) {
    chartPathLength.value = polylineRef.value.getTotalLength()
  }
}

async function playReportAnimations() {
  if (!props.report) return

  // 1) 일단 전부 0/숨김 상태로 리셋
  barsVisible.value = false
  chartRevealed.value = false
  animatedTotalSpent.value = 0
  animatedTotalSaved.value = 0

  await nextTick()
  updateChartPathLength()

  // 2) 숫자는 바로 카운트업 시작
  animateNumberTo((v) => (animatedTotalSpent.value = v), 0, props.report.summary.totalSpent)
  animateNumberTo((v) => (animatedTotalSaved.value = v), 0, props.report.savings.totalSaved)

  // 3) 프로그레스바/그래프는 한 프레임 뒤에 목표값으로 트랜지션 (0 → target)
  requestAnimationFrame(() => {
    barsVisible.value = true
    chartRevealed.value = true
  })
}

watch(
  () => props.report?.yearMonth,
  () => {
    playReportAnimations()
  }
)

onMounted(() => {
  playReportAnimations()
})
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
