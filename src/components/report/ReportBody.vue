<template>
  <div class="flex flex-col gap-8">
    <!-- 월 네비게이션 -->
    <div class="flex flex-col items-center gap-1">
      <span class="text-xs font-medium text-gray-400">{{ yearLabel }}</span>

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

        <h2 class="text-lg font-bold text-gray-900">{{ monthLabel }}의 리포트</h2>

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
    </div>

    <!-- 소비 스타일 카드 -->
    <div
      class="-mt-2 rounded-2xl bg-white border border-[#E8EDE4] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] px-5 py-4 flex flex-col items-center gap-3"
    >
      <div v-if="spendingType" class="flex flex-col items-center gap-3 text-center">
        <img :src="spendingTypeImage" alt="소비 유형" class="w-56 h-32 object-contain" />

        <p class="leading-snug">
          <span class="block text-xl font-bold text-gray-900"> {{ subjectLabel }} 유형은 </span>

          <span class="block text-2xl font-extrabold text-avocado-600 my-1">
            '{{ spendingType.name }}'
          </span>

          <span class="block text-xl font-bold text-gray-900"> 이었어요! </span>
        </p>

        <span
          v-if="spendingType.percentage != null"
          class="inline-block bg-gray-100 text-gray-500 text-xs font-semibold px-4 py-2 rounded-full"
        >
          아보카도 사용 어린이 중 {{ spendingType.percentage }}%가 같은 유형이에요
        </span>

        <div ref="popoverWrapperRef" class="relative">
          <button
            type="button"
            class="text-xs underline underline-offset-2"
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
                <span class="font-bold"> "{{ spendingType.name }}" </span>
                유형은
                {{ spendingType.parentDescription }}
              </p>
            </div>
          </Transition>
        </div>
      </div>

      <div v-else class="text-sm text-muted py-4">소비 유형을 불러오는 중...</div>
    </div>

    <!-- 슬라이드 카드 -->
    <div
      class="-mt-2 relative w-full rounded-3xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] overflow-hidden"
    >
      <!-- 슬라이드 영역 -->
      <div class="relative overflow-hidden">
        <div
          class="flex touch-pan-y transition-transform duration-300 ease-out"
          :style="{
            transform: `translateX(-${activeSlide * 100}%)`
          }"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <!-- 1. 이번 달 소비 금액 -->
          <div class="relative w-full shrink-0 py-4 px-4" style="background-color: #fff8f5">
            <div class="mx-6 flex flex-col gap-5">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm" style="color: #9aa090">{{ monthLabel }}에 사용한 돈</p>

                  <p class="mt-1 text-3xl font-bold" style="color: #1d1b16">
                    {{ animatedTotalSpent.toLocaleString('ko-KR') }}원
                  </p>

                  <!-- 전월 소비 비교 -->
                  <p
                    class="mt-3 w-fit rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1"
                    :style="comparisonStyle"
                  >
                    {{ comparisonText }}
                  </p>
                </div>

                <img
                  :src="childImage"
                  alt=""
                  class="w-20 h-20 object-contain shrink-0 pointer-events-none"
                />
              </div>

              <div
                class="flex items-center justify-between pt-4"
                style="border-top: 1px solid #f3e2d8"
              >
                <div>
                  <p class="text-sm" style="color: #9aa090">
                    {{ monthLabel }}에 총 몇 번 썼을까요?
                  </p>

                  <p class="text-lg font-bold" style="color: #1d1b16">
                    {{ report.summary.transactionCount }}번
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. 지출 Top 3 -->
          <div class="w-full shrink-0 py-4 px-4 flex flex-col" style="background-color: #f5faff">
            <div class="mx-6 flex flex-1 flex-col">
              <p class="text-base font-bold mb-4" style="color: #1d1b16">
                가장 돈을 많이 쓴 곳은 어디일까요?
              </p>

              <div v-if="coloredTopSpots.length > 0" class="flex flex-col gap-4">
                <div v-for="spot in coloredTopSpots" :key="spot.rank" class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between text-sm">
                    <span class="flex items-center gap-1.5" style="color: #1d1b16">
                      <span
                        class="w-2.5 h-2.5 rounded-full"
                        :style="{
                          backgroundColor: spot.color
                        }"
                      />

                      {{ spot.category }}
                    </span>

                    <span style="color: #1d1b16">
                      <span class="font-bold"> {{ spot.percentage }}% </span>

                      <span style="color: #9aa090">
                        ({{ spot.amount.toLocaleString('ko-KR') }}원)
                      </span>
                    </span>
                  </div>

                  <div class="h-2 rounded-full overflow-hidden" style="background-color: #ebebeb">
                    <div
                      class="h-full rounded-full"
                      :style="{
                        width: topSpotsBarsVisible ? `${spot.percentage}%` : '0%',
                        backgroundColor: spot.color,
                        transition: topSpotsBarsVisible ? 'width 0.7s ease-out' : 'none'
                      }"
                    />
                  </div>
                </div>
              </div>

              <div v-else class="flex flex-1 items-center justify-center">
                <p class="text-sm" style="color: #9aa090">소비 내역이 없어요</p>
              </div>
            </div>
          </div>

          <!-- 3. 이번 달 저금액 -->
          <div class="w-full shrink-0 py-4 px-4" style="background-color: #fdf3d1">
            <div class="mx-6 pt-1">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm" style="color: #9aa090">{{ monthLabel }}에 모은 돈</p>

                  <p class="mt-1 text-3xl font-bold" style="color: #1d1b16">
                    {{ animatedTotalSaved.toLocaleString('ko-KR') }}원
                  </p>

                  <p class="mt-1 text-sm" style="color: #e0a800">저금했어요!</p>
                </div>

                <img
                  :src="piggyImage"
                  alt="저금통"
                  class="w-30 h-30 object-contain shrink-0 pointer-events-none"
                />
              </div>

              <div
                class="flex items-center justify-between mt-6 mb-2 pt-4"
                style="border-top: 1px solid #f0e3b0"
              >
                <p class="text-sm" style="color: #9aa090">
                  {{ monthLabel }}에 받은 용돈, 얼마나 저금했을까요?
                </p>

                <span class="text-sm font-semibold" style="color: #e0a800">
                  {{
                    report.savings.savingsRate != null
                      ? `${report.savings.savingsRate}%`
                      : '집계 중'
                  }}
                </span>
              </div>

              <div class="h-4 rounded-full overflow-hidden" style="background-color: #f3f4f6">
                <div
                  class="h-full rounded-full"
                  :style="{
                    backgroundColor: '#f5c518',
                    width: savingsBarVisible
                      ? `${getPercentage(report.savings.savingsRate)}%`
                      : '0%',
                    transition: savingsBarVisible ? 'width 0.7s ease-out' : 'none'
                  }"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 disabled:opacity-30"
          :disabled="activeSlide === 0"
          aria-label="이전 카드"
          @click="goToSlide(activeSlide - 1)"
        >
          <ChevronLeft :size="20" />
        </button>

        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 disabled:opacity-30"
          :disabled="activeSlide === SLIDE_COUNT - 1"
          aria-label="다음 카드"
          @click="goToSlide(activeSlide + 1)"
        >
          <ChevronRight :size="20" />
        </button>
      </div>

      <!-- 슬라이드 인디케이터 -->
      <div class="flex items-center justify-center gap-1.5 py-4 bg-white">
        <button
          v-for="i in 3"
          :key="i"
          type="button"
          class="h-1.5 rounded-full transition-all"
          :class="activeSlide === i - 1 ? 'w-4' : 'w-1.5'"
          :style="{
            backgroundColor: activeSlide === i - 1 ? '#5E5F5E' : '#B5B5B5'
          }"
          :aria-label="`${i}번째 카드로 이동`"
          @click="goToSlide(i - 1)"
        />
      </div>
    </div>

    <!-- 월별 소비 비교 -->
    <div
      ref="chartSectionRef"
      class="-mt-4 rounded-2xl flex flex-col shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)]"
      style="background-color: #f7f5ff; padding: 24px 20px; gap: 16px; min-height: 236px"
    >
      <p class="text-base font-bold" style="color: #1d1b16">달마다 쓴 돈을 비교해 봐요!</p>

      <svg viewBox="0 0 300 130" class="w-full h-36">
        <line x1="14" y1="100" x2="286" y2="100" stroke="#E3DEF5" stroke-width="1" />

        <g v-for="(point, index) in chartPoints" :key="point.yearMonth">
          <rect
            :x="point.barX"
            :y="point.barY"
            :width="point.barWidth"
            :height="point.barHeight"
            rx="6"
            :fill="index === chartPoints.length - 1 ? '#8B6FB8' : '#D6C7EC'"
            :style="{
              transformOrigin: 'center bottom',
              transformBox: 'fill-box',
              transform: chartRevealed ? 'scaleY(1)' : 'scaleY(0)',
              transition: chartRevealed ? `transform 0.6s ease-out ${index * 0.12}s` : 'none'
            }"
          />

          <text
            :x="point.x"
            :y="point.barY - 8"
            text-anchor="middle"
            font-size="11"
            :font-weight="index === chartPoints.length - 1 ? '700' : '600'"
            :fill="index === chartPoints.length - 1 ? '#5B4B8A' : '#8B6FB8'"
            :style="{
              opacity: chartRevealed ? 1 : 0,
              transition: chartRevealed ? `opacity 0.4s ease-out ${0.4 + index * 0.12}s` : 'none'
            }"
          >
            {{ point.amount.toLocaleString('ko-KR') }}원
          </text>

          <text
            :x="point.x"
            y="118"
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
    <!-- 조언은 매달 1일 AI 배치가 채운다. 아직 없는 달에는 통째로 감춘다. -->
    <div v-if="report.advice" class="-mt-2 flex items-center gap-1">
      <img
        :src="cadoseedImage"
        alt="아보카도 씨"
        class="relative z-10 w-32 h-32 mt-6 object-contain shrink-0 pointer-events-none"
      />

      <div
        class="relative z-0 flex-1 rounded-2xl bg-progress-value shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)]"
        style="padding: 12px 16px 16px"
      >
        <span
          class="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-progress-value"
          style="clip-path: polygon(100% 0, 100% 100%, 0 50%)"
        />

        <div class="relative flex flex-col gap-1.5 text-white">
          <p class="text-sm font-bold">아보카도 씨의 한마디</p>

          <p class="text-xs leading-relaxed">{{ report.advice }}</p>
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
import childImage from '@/assets/images/child.png'

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
  subjectLabel: {
    type: String,
    required: true
  },
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

/* 소비 유형 설명 팝오버 */
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

  if (numberAnimationFrame) {
    cancelAnimationFrame(numberAnimationFrame)
  }

  chartObserver?.disconnect()
})

/* 슬라이드 */
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
    revealSlide(activeSlide.value)
  } else if (touchDeltaX > SWIPE_THRESHOLD && activeSlide.value > 0) {
    activeSlide.value -= 1
    revealSlide(activeSlide.value)
  }

  touchDeltaX = 0
}

function goToSlide(index) {
  if (index < 0 || index >= SLIDE_COUNT) {
    return
  }

  activeSlide.value = index
  revealSlide(index)
}

/* 년도 표시 */
const yearLabel = computed(() => {
  if (!props.report) return ''

  const [year] = props.report.yearMonth.split('-')

  return `${year}년`
})

/* 월 표시 */
const monthLabel = computed(() => {
  if (!props.report) return ''

  const [, month] = props.report.yearMonth.split('-')

  return `${Number(month)}월`
})

/* 이전 달 표시 */
const previousMonthLabel = computed(() => {
  if (!props.report?.yearMonth) return ''

  const [, monthString] = props.report.yearMonth.split('-')

  const month = Number(monthString)

  return month === 1 ? '12월' : `${month - 1}월`
})

/* 전월 소비 금액 차이 */
const comparedToLastMonth = computed(() => {
  return Number(props.report?.summary?.comparedToLastMonth ?? 0)
})

/* 전월 비교 문구 */
const comparisonText = computed(() => {
  const difference = comparedToLastMonth.value

  if (difference === 0) {
    return '지난달과 같은 금액을 사용했네요!'
  }

  const formattedAmount = Math.abs(difference).toLocaleString('ko-KR')

  if (difference > 0) {
    return `${previousMonthLabel.value}보다 ${formattedAmount}원 더 썼어요!`
  }

  return `${previousMonthLabel.value}보다 ${formattedAmount}원 덜 썼어요!`
})

/* 전월 비교 색상 */
const comparisonStyle = computed(() => {
  const difference = comparedToLastMonth.value

  if (difference > 0) {
    return {
      color: '#FF765C',
      backgroundColor: '#FFE2D9'
    }
  }

  if (difference < 0) {
    return {
      color: '#5B9BD5',
      backgroundColor: '#E5F1FB'
    }
  }

  return {
    color: '#7A7F86',
    backgroundColor: '#F1F2F4'
  }
})

/* Top3 색상 */
const coloredTopSpots = computed(() => {
  if (!props.report) return []

  return props.report.topSpots.slice(0, TOP_SPOTS_DISPLAY_COUNT).map((spot, index) => ({
    ...spot,
    color: TOP_SPOT_COLORS[index % TOP_SPOT_COLORS.length]
  }))
})

/* 월별 소비 비교 */
const chartPoints = computed(() => {
  if (!props.report || props.report.monthlyComparison.length === 0) {
    return []
  }

  const values = props.report.monthlyComparison.map((m) => m.amount)

  const max = Math.max(...values, 1)

  const width = 260
  const leftPad = 20
  const baselineY = 100
  const maxBarHeight = 64
  const minBarHeight = 4

  const count = props.report.monthlyComparison.length
  const slot = width / count
  const barWidth = Math.min(32, slot * 0.5)

  return props.report.monthlyComparison.map((m, index) => {
    const barHeight = Math.max(minBarHeight, (m.amount / max) * maxBarHeight)
    const x = leftPad + slot * (index + 0.5)

    return {
      x,
      barX: x - barWidth / 2,
      barY: baselineY - barHeight,
      barWidth,
      barHeight,
      amount: m.amount,
      month: m.month,
      yearMonth: m.yearMonth
    }
  })
})

function getPercentage(value) {
  const percentage = Number(value ?? 0)

  return Math.min(100, Math.max(0, percentage))
}

/* 애니메이션 */
const animatedTotalSpent = ref(0)
const animatedTotalSaved = ref(0)
const topSpotsBarsVisible = ref(false)
const savingsBarVisible = ref(false)
const chartRevealed = ref(false)
const chartSectionRef = ref(null)

let numberAnimationFrame = null
let chartObserver = null

function animateNumberTo(setter, from, to, duration = NUMBER_ANIMATION_DURATION) {
  const startTime = performance.now()
  const diff = to - from

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1)

    const eased = 1 - Math.pow(1 - progress, 3)

    setter(Math.round(from + diff * eased))

    if (progress < 1) {
      numberAnimationFrame = requestAnimationFrame(tick)
    }
  }

  numberAnimationFrame = requestAnimationFrame(tick)
}

/* 카드를 넘길 때마다 해당 슬라이드의 숫자/막대 애니메이션을 다시 재생한다. */
function revealSlide(index) {
  if (!props.report) return

  if (index === 0) {
    animateNumberTo((v) => (animatedTotalSpent.value = v), 0, props.report.summary.totalSpent)
  } else if (index === 1) {
    topSpotsBarsVisible.value = false

    requestAnimationFrame(() => {
      topSpotsBarsVisible.value = true
    })
  } else if (index === 2) {
    animatedTotalSaved.value = 0
    animateNumberTo((v) => (animatedTotalSaved.value = v), 0, props.report.savings.totalSaved)

    savingsBarVisible.value = false

    requestAnimationFrame(() => {
      savingsBarVisible.value = true
    })
  }
}

/* 월별 소비 비교 그래프는 스크롤로 화면에 들어왔을 때 애니메이션을 재생한다. */
function observeChartReveal() {
  chartObserver?.disconnect()

  if (!chartSectionRef.value) return

  chartObserver = new IntersectionObserver(
    ([entry]) => {
      chartRevealed.value = entry.isIntersecting
    },
    { threshold: 0.5 }
  )

  chartObserver.observe(chartSectionRef.value)
}

async function playReportAnimations() {
  if (!props.report) return

  activeSlide.value = 0
  topSpotsBarsVisible.value = false
  savingsBarVisible.value = false
  animatedTotalSpent.value = 0
  animatedTotalSaved.value = 0
  chartRevealed.value = false

  await nextTick()

  revealSlide(0)
  observeChartReveal()
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
