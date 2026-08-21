<template>
  <article
    class="relative p-[16px] grid gap-[13px] rounded-2xl shadow-[0_7px_19px_rgba(37,54,42,0.08)] cursor-pointer"
    style="background-color: #f5faff"
    @click="goToDetail"
  >
    <header
      class="min-w-0 grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-[11px]"
      :class="{ 'opacity-[0.45]': isFinished }"
    >
      <span
        class="w-[46px] h-[46px] grid place-items-center rounded-2xl text-[21px]"
        style="background-color: #f3f3f3"
        aria-hidden="true"
      >
        {{ icon }}
      </span>
      <!--  D-day 추가 -->
      <div class="min-w-0">
        <h2
          class="overflow-hidden text-base font-bold text-ellipsis whitespace-nowrap"
          style="color: #1d1b16"
        >
          {{ item.name }}
        </h2>
        <p class="text-xs font-bold mt-0.5" :style="{ color: hasBonus ? '#4e9440' : '#939393' }">
          보호자 추가 보너스 {{ bonusText }}
        </p>
      </div>

      <!-- 아이 화면: 즐겨찾기(하트) 토글 -->
      <button
        v-if="!isCompleted"
        type="button"
        class="flex items-center gap-1.5 py-[7px] px-[12px] border-0 rounded-full cursor-pointer whitespace-nowrap"
        :style="{
          backgroundColor: item.favorite ? '#FD98E7' : '#F3F3F3',
          color: item.favorite ? '#000000' : '#989898'
        }"
        :aria-pressed="Boolean(item.favorite)"
        :aria-label="item.favorite ? '즐겨찾기 등록됨' : '즐겨찾기 등록 안 됨'"
        @click.stop="toggleFavorite"
      >
        <svg
          width="14"
          height="13"
          viewBox="0 0 20 19"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 18.35L8.55 17.05C6.86667 15.5333 5.475 14.225 4.375 13.125C3.275 12.025 2.4 11.0375 1.75 10.1625C1.1 9.2875 0.645833 8.48333 0.3875 7.75C0.129167 7.01667 0 6.26667 0 5.5C0 3.93333 0.525 2.625 1.575 1.575C2.625 0.525 3.93333 0 5.5 0C6.36667 0 7.19167 0.183333 7.975 0.55C8.75833 0.916667 9.43333 1.43333 10 2.1C10.5667 1.43333 11.2417 0.916667 12.025 0.55C12.8083 0.183333 13.6333 0 14.5 0C16.0667 0 17.375 0.525 18.425 1.575C19.475 2.625 20 3.93333 20 5.5C20 6.26667 19.8708 7.01667 19.6125 7.75C19.3542 8.48333 18.9 9.2875 18.25 10.1625C17.6 11.0375 16.725 12.025 15.625 13.125C14.525 14.225 13.1333 15.5333 11.45 17.05L10 18.35Z"
            fill="currentColor"
          />
        </svg>
        <span class="text-[11px] font-bold">즐겨찾기</span>
      </button>
    </header>

    <!-- 진행률 -->
    <div class="grid gap-[9px]" :class="{ 'opacity-[0.45]': isFinished }">
      <div class="flex items-center justify-between">
        <small class="text-sm" style="color: #72796b">진행률</small>
        <strong class="text-xl" style="color: #000000">{{ safeRate }}%</strong>
      </div>

      <div class="w-full h-2.5 overflow-hidden rounded-full" style="background-color: #ebebeb">
        <div
          class="h-full rounded-full transition-[width] duration-700 ease-out"
          :style="{ width: revealed ? `${safeRate}%` : '0%', backgroundColor: progressColor }"
        ></div>
      </div>
    </div>

    <section
      v-if="isPendingAchieve"
      class="min-h-[62px] py-3 px-[14px] flex items-start gap-2 rounded-2xl bg-white"
    >
      <img :src="cadoseedImage" alt="" aria-hidden="true" class="w-8 h-8 object-contain shrink-0" />

      <p v-if="hasBonus" class="text-[12px] leading-relaxed" style="color: #555353">
        <strong style="color: #e1585a">{{ dday }}일만 더</strong> 기다리면 모은 돈을 돌려받을 수
        있어요.<br />
        보너스 <strong style="color: #4e9440">{{ bonusText }}</strong
        >은 <strong style="color: #e1585a">{{ dueDateText }}</strong> 뒤에 송금할 수 있어요
      </p>
      <p v-else class="text-[12px] leading-relaxed" style="color: #555353">
        <strong style="color: #e1585a">{{ dday }}일만 더</strong> 기다리면 모은 돈을 돌려받을 수
        있어요
      </p>
    </section>

    <section
      v-else
      class="min-h-[62px] py-3 px-[14px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-white"
      :class="{ 'opacity-[0.45]': isFinished }"
    >
      <div class="grid gap-[5px]">
        <small class="text-[11px] font-bold" style="color: #939393">남은 금액</small>
        <strong class="text-[13px]" style="color: #000000">{{ won(remainingAmount) }}</strong>
      </div>

      <div class="grid gap-[5px] text-right">
        <small class="text-[11px] font-bold" style="color: #939393">목표</small>
        <strong class="text-[13px]" style="color: #000000">{{ won(item.targetAmount) }}</strong>
      </div>
    </section>
  </article>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import cadoseedImage from '@/assets/images/cadoseed.png'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['toggle-favorite'])

const router = useRouter()

// 화면 진입 시 0% → 실제 진행률로 슈욱 차오르는 연출
const revealed = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    revealed.value = true
  })
})

function goToDetail() {
  router.push({ name: 'piggyChildDetail', params: { id: props.item.piggyBankId } })
}

function toggleFavorite() {
  emit('toggle-favorite', props.item)
}

const normalizedStatus = computed(() => String(props.item.status ?? '').toUpperCase())

const isPendingAchieve = computed(() => normalizedStatus.value === 'PENDING_ACHIEVE')

const remainingAmount = computed(() => {
  if (isCompleted.value) return 0
  return Math.max(0, Number(props.item.targetAmount || 0) - Number(props.item.savedAmount || 0))
})

// D-day 추가
const dday = computed(() => {
  if (normalizedStatus.value !== 'PENDING_ACHIEVE' || !props.item.firstDepositedAt) return null
  const s = new Date(props.item.firstDepositedAt)
  const complete = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7) // 완료일 자정
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // 오늘 자정
  return Math.max(0, Math.round((complete - today) / 86400000))
})

const dueDateText = computed(() => {
  if (!props.item.firstDepositedAt) return ''
  const s = new Date(props.item.firstDepositedAt)
  const due = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7)
  return `${due.getMonth() + 1}월 ${due.getDate()}일`
})

const isCompleted = computed(() =>
  ['ACHIEVE', 'ACHIEVED', 'COMPLETED'].includes(normalizedStatus.value)
)

const bonusStatus = computed(() => String(props.item.bonus?.status ?? '').toUpperCase())

const isBonusPaid = computed(() => ['PAID', 'COMPLETED'].includes(bonusStatus.value))
const hasBonus = computed(() => String(props.item.bonus?.type ?? 'NONE').toUpperCase() !== 'NONE')
// 최종 완료 = 목표 달성 AND (보너스 없거나 OR 보너스 지급완료)
const isFinished = computed(() => isCompleted.value && (!hasBonus.value || isBonusPaid.value))

const icon = computed(() => {
  if (props.item.icon) return props.item.icon

  const text = `${props.item.name ?? ''} ${props.item.description ?? ''}`
  if (text.includes('자전거')) return '🚲'
  if (text.includes('책')) return '📚'
  if (text.includes('게임')) return '🎮'
  if (text.includes('여행')) return '🌍'
  if (text.includes('선물')) return '🎁'
  return '🚀'
})

const bonusText = computed(() => {
  const bonus = props.item.bonus
  if (!bonus || String(bonus.type ?? 'NONE').toUpperCase() === 'NONE') return '없음'

  if (['PAID', 'COMPLETED'].includes(bonusStatus.value)) {
    return won(bonus.paidAmount ?? bonus.amount ?? calculateRateBonus(bonus))
  }

  const expectedAmount = bonus.amount ?? calculateRateBonus(bonus)
  if (Number(expectedAmount) > 0) return `${won(expectedAmount)}`
  return '미지급'
})

function calculateRateBonus(bonus) {
  if (String(bonus?.type).toUpperCase() !== 'RATE' || bonus?.rate == null) return 0
  return Math.floor((Number(props.item.targetAmount || 0) * Number(bonus.rate)) / 100)
}

function won(amount) {
  return `${Number(amount || 0).toLocaleString('ko-KR')}원`
}

const safeRate = computed(() => {
  if (isCompleted.value) return 100
  const value = Number(props.item.progressRate || 0)
  return Math.min(100, Math.max(0, value))
})

const PROGRESS_COLORS = ['#FF8C69', '#7BC8F5', '#B39DDB']
const progressColor = computed(() => PROGRESS_COLORS[props.index % PROGRESS_COLORS.length])
</script>
