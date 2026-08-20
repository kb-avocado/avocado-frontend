<template>
  <article
    class="relative p-[16px] grid gap-[13px] rounded-[20px] shadow-[0_7px_19px_rgba(37,54,42,0.08)] cursor-pointer"
    style="background-color: #f5faff"
    @click="goToDetail"
  >
    <header
      class="min-w-0 grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-[11px]"
      :class="{ 'opacity-[0.45]': isFinished }"
    >
      <span
        class="w-[46px] h-[46px] grid place-items-center rounded-[14px] text-[21px]"
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

        <p v-if="dday !== null" class="text-xs font-bold mt-0.5" style="color: #e1585a">
          {{ dday === 0 ? '저금통 완료 D-day' : `저금통 완료 D-${dday}` }}
        </p>
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
      class="relative z-[3] min-h-[62px] py-3 px-[14px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[13px] bg-white"
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

    <!-- 100% 달성 대기 / 완료 저금통 -->
    <section
      v-else
      class="relative z-[3] min-h-[62px] py-3 px-[14px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[13px] bg-white"
      :class="{ 'opacity-[0.45]': isFinished }"
      @click.stop
    >
      <div class="grid gap-[5px]">
        <small class="text-[11px] font-bold" style="color: #939393"> 보호자님 추가 보너스 </small>

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
        class="min-w-[91px] h-[38px] border-0 rounded-[10px] bg-avocado-600 text-white text-[11px] font-bold disabled:bg-[#dcead5] disabled:shadow-none"
        :disabled="!isCompleted || !hasBonus || isBonusPaid"
        @click.stop="goToBonusTransfer"
      >
        보너스 송금
      </button>
    </section>

    <!-- 최종 완료 오버레이 -->
    <div
      v-if="isFinished"
      class="absolute z-[2] top-[52%] left-1/2 min-w-[140px] py-3 px-[15px] -translate-x-1/2 -translate-y-1/2 rounded-[11px] text-white text-[15px] text-center shadow-[0_6px_14px_rgba(89,121,177,0.32)]"
      style="background-color: #71a0ef"
    >
      저금통 깨기 완료!
    </div>
  </article>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

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
