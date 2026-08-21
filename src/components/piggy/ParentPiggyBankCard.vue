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

      <!-- 목표명 + D-day -->
      <div class="min-w-0">
        <h2
          class="overflow-hidden text-base font-bold text-ellipsis whitespace-nowrap"
          style="color: #1d1b16"
        >
          {{ item.name }}
        </h2>
      </div>

      <!--
        응원보내기는 완전히 진행 중인 ACTIVE 저금통에서만 표시

        ACTIVE          → 표시
        PENDING_ACHIEVE → 숨김
        완료 상태       → 숨김
      -->
      <button
        v-if="isActive"
        type="button"
        class="py-[7px] px-[12px] border-0 rounded-full text-xs font-bold whitespace-nowrap"
        style="background-color: #fcf7c2; color: #555353"
        @click.stop="goToCheerMessages"
      >
        응원보내기
      </button>
    </header>

    <!-- 진행률 -->
    <div class="grid gap-[9px]" :class="{ 'opacity-[0.45]': isFinished }">
      <div class="flex items-center justify-between">
        <small class="text-sm" style="color: #72796b"> 진행률 </small>

        <strong class="text-xl" style="color: #000000"> {{ safeRate }}% </strong>
      </div>

      <div class="w-full h-2.5 overflow-hidden rounded-full" style="background-color: #ebebeb">
        <div
          class="h-full rounded-full transition-[width] duration-700 ease-out"
          :style="{
            width: revealed ? `${safeRate}%` : '0%',
            backgroundColor: progressColor
          }"
        ></div>
      </div>
    </div>

    <!-- 진행 중인 저금통 -->
    <section
      v-if="isActive"
      class="relative z-[3] min-h-[62px] py-3 px-[14px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-white"
      :class="{ 'opacity-[0.45]': isFinished }"
    >
      <div class="grid gap-[5px]">
        <small class="text-[11px]" style="color: #939393"> 남은 금액 </small>

        <strong class="text-[13px]" style="color: #000000">
          {{ won(remainingAmount) }}
        </strong>
      </div>

      <div class="grid gap-[5px] text-right">
        <small class="text-[11px]" style="color: #939393"> 목표 </small>

        <strong class="text-[13px]" style="color: #000000">
          {{ won(item.targetAmount) }}
        </strong>
      </div>
    </section>

    <!-- 예치기간 대기 중 -->
    <section
      v-else-if="isPendingAchieve"
      class="relative z-[3] min-h-[62px] py-3 px-[14px] flex items-start gap-2 rounded-2xl bg-white"
      @click.stop
    >
      <img :src="cadoseedImage" alt="" aria-hidden="true" class="w-8 h-8 object-contain shrink-0" />
      <p class="text-[12px] leading-relaxed" style="color: #555353">
        <strong style="color: #e1585a">{{ dday }}일만 더</strong> 기다리면 모은 돈을 돌려받을 수
        있어요.<br />
        <template v-if="hasBonus">
          보너스 <strong style="color: #4e9440">{{ bonusAmountText }}</strong
          >은 <strong style="color: #e1585a">{{ dueDateText }}</strong> 뒤에 송금 할 수 있어요.
        </template>
      </p>
    </section>

    <!-- 완료 / 보너스 대기 저금통: 보너스가 설정된 경우에만 표시 -->
    <section
      v-else-if="hasBonus"
      class="relative z-[3] min-h-[62px] py-3 px-[14px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-white"
      :class="{ 'opacity-[0.45]': isFinished }"
      @click.stop
    >
      <div class="grid gap-[5px]">
        <small class="text-[11px] font-bold" style="color: #939393"> 보호자 추가 보너스 </small>

        <strong
          class="text-[13px]"
          :style="{
            color: !hasBonus ? '#939393' : isBonusPaid ? '#4e9440' : '#e1585a'
          }"
        >
          {{ !hasBonus ? '없음' : isBonusPaid ? '지급 완료' : '미지급' }}
        </strong>
      </div>

      <button
        type="button"
        class="min-w-[91px] h-[38px] border-0 rounded-2xl bg-avocado-600 text-white text-[11px] font-bold disabled:bg-[#dcead5] disabled:shadow-none"
        :disabled="!isCompleted || !hasBonus || isBonusPaid"
        @click.stop="goToBonusTransfer"
      >
        보너스 송금
      </button>
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

  childId: {
    type: [String, Number],
    required: true
  },

  index: {
    type: Number,
    default: 0
  }
})

const router = useRouter()

/* 진행률 애니메이션 */
const revealed = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    revealed.value = true
  })
})

/* 서버 status 대문자 통일 */
const normalizedStatus = computed(() => String(props.item.status ?? '').toUpperCase())

const isPendingAchieve = computed(() => normalizedStatus.value === 'PENDING_ACHIEVE')

/*
 * 100% 달성했지만
 * 저금통 생성/첫 입금 기준 최소 7일이 지나지 않은 경우 D-day 표시
 */
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

/* 보너스 송금 화면 */
function goToBonusTransfer() {
  router.push({
    name: 'piggyGoalComplete',
    params: {
      childId: props.childId,
      id: props.item.piggyBankId
    }
  })
}

/* 응원 메시지 작성 */
function goToCheerMessages() {
  router.push({
    name: 'piggyCheerCompose',
    params: {
      childId: props.childId,
      id: props.item.piggyBankId
    }
  })
}

/* 저금통 상세 */
function goToDetail() {
  router.push({
    name: 'piggyDetail',
    params: {
      childId: props.childId,
      id: props.item.piggyBankId
    }
  })
}

/*
 * 완전히 진행 중인 저금통
 *
 * 응원보내기는 이 상태에서만 보여준다.
 */
const isActive = computed(() => normalizedStatus.value === 'ACTIVE')

/* 완료 상태 */
const isCompleted = computed(() =>
  ['ACHIEVE', 'ACHIEVED', 'COMPLETED'].includes(normalizedStatus.value)
)

/* 보너스 상태 */
const bonusStatus = computed(() => String(props.item.bonus?.status ?? '').toUpperCase())

/* 보너스 지급 완료 여부 */
const isBonusPaid = computed(() => ['PAID', 'COMPLETED'].includes(bonusStatus.value))

/* 보너스 설정 여부 */
const hasBonus = computed(() => String(props.item.bonus?.type ?? 'NONE').toUpperCase() !== 'NONE')

function calculateRateBonus(bonus) {
  if (String(bonus?.type).toUpperCase() !== 'RATE' || bonus?.rate == null) return 0
  return Math.floor((Number(props.item.targetAmount || 0) * Number(bonus.rate)) / 100)
}

const bonusAmountText = computed(() => {
  const bonus = props.item.bonus
  if (!bonus) return ''
  return won(bonus.amount ?? calculateRateBonus(bonus))
})

/*
 * 최종 완료

 * 목표 달성
 * +
 * 보너스가 없거나 보너스 지급 완료
 */
const isFinished = computed(() => isCompleted.value && (!hasBonus.value || isBonusPaid.value))

/* 남은 금액 */
const remainingAmount = computed(() =>
  Math.max(0, Number(props.item.targetAmount || 0) - Number(props.item.savedAmount || 0))
)

/* 저금통 아이콘 */
const icon = computed(() => {
  if (props.item.icon) {
    return props.item.icon
  }

  const text = `${props.item.name ?? ''} ${props.item.description ?? ''}`

  if (text.includes('자전거')) return '🚲'
  if (text.includes('책')) return '📚'
  if (text.includes('게임')) return '🎮'
  if (text.includes('여행')) return '🌍'
  if (text.includes('선물')) return '🎁'

  return '🚀'
})

/* 금액 표시 */
function won(amount) {
  return `${Number(amount || 0).toLocaleString('ko-KR')}원`
}

/* 진행률 */
const safeRate = computed(() => {
  if (isCompleted.value) return 100
  const value = Number(props.item.progressRate || 0)

  return Math.min(100, Math.max(0, value))
})

/* 카드별 진행률 색상 */
const PROGRESS_COLORS = ['#FF8C69', '#7BC8F5', '#B39DDB']

const progressColor = computed(() => PROGRESS_COLORS[props.index % PROGRESS_COLORS.length])
</script>
