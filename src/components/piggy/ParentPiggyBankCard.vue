<template>
  <article
    class="relative p-[16px] grid gap-[13px] rounded-[20px] shadow-[0_7px_19px_rgba(37,54,42,0.08)] cursor-pointer"
    style="background-color: #f5faff"
    @click="goToDetail"
  >
    <header
      class="min-w-0 grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-[11px]"
      :class="{ 'opacity-[0.45]': isCompleted }"
    >
      <span
        class="w-[46px] h-[46px] grid place-items-center rounded-[14px] text-[21px]"
        style="background-color: #f3f3f3"
        aria-hidden="true"
      >
        {{ icon }}
      </span>

      <h2
        class="min-w-0 overflow-hidden text-lg font-bold text-ellipsis whitespace-nowrap"
        style="color: #1d1b16"
      >
        {{ item.name }}
      </h2>

      <!-- 부모 화면: 응원보내기 -->
      <button
        type="button"
        class="py-[7px] px-[12px] border-0 rounded-full text-xs font-bold whitespace-nowrap"
        style="background-color: #fcf7c2; color: #555353"
        @click.stop="goToCheerMessages"
      >
        응원보내기
      </button>
    </header>

    <!-- 진행률 -->
    <div class="grid gap-[9px]" :class="{ 'opacity-[0.45]': isCompleted }">
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
      v-if="isActive"
      class="relative z-[3] min-h-[62px] py-3 px-[14px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[13px] bg-white"
      :class="{ 'opacity-[0.45]': isCompleted }"
    >
      <div class="grid gap-[5px]">
        <small class="text-[11px]" style="color: #939393">남은 금액</small>
        <strong class="text-[13px]" style="color: #000000">{{ won(remainingAmount) }}</strong>
      </div>

      <div class="grid gap-[5px] text-right">
        <small class="text-[11px]" style="color: #939393">목표</small>
        <strong class="text-[13px]" style="color: #000000">{{ won(item.targetAmount) }}</strong>
      </div>
    </section>

    <section
      v-else
      class="relative z-[3] min-h-[62px] py-3 px-[14px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[13px] bg-white"
      :class="{ 'opacity-[0.45]': isCompleted }"
      @click.stop
    >
      <div class="grid gap-[5px]">
        <small class="text-[11px] font-bold" style="color: #939393">보호자님 추가 보너스</small>
        <strong class="text-[13px]" :style="{ color: isBonusPaid ? '#4e9440' : '#e1585a' }">
          {{ isBonusPaid ? '지급 완료' : '미지급' }}
        </strong>
      </div>

      <button
        type="button"
        class="min-w-[91px] h-[38px] border-0 rounded-[10px] bg-avocado-600 text-white text-[11px] font-bold disabled:bg-[#dcead5] disabled:shadow-none"
        :disabled="!isCompleted || isBonusPaid"
        @click.stop="goToBonusTransfer"
      >
        보너스 송금
      </button>
    </section>

    <div
      v-if="isCompleted"
      class="absolute z-[2] top-[52%] left-1/2 min-w-[140px] py-3 px-[15px] -translate-x-1/2 -translate-y-1/2 rounded-[11px] bg-avocado-600 text-white text-[13px] font-extrabold text-center shadow-[0_6px_14px_rgba(91,154,63,0.32)]"
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

// 화면 진입 시 0% → 실제 진행률로 슈욱 차오르는 연출
const revealed = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    revealed.value = true
  })
})

const normalizedStatus = computed(() => String(props.item.status ?? '').toUpperCase())

function goToBonusTransfer() {
  router.push({
    name: 'piggyGoalComplete',
    params: { childId: props.childId, id: props.item.piggyBankId }
  })
}

function goToCheerMessages() {
  const inProgress = ['ACTIVE', 'PENDING_ACHIEVE'].includes(normalizedStatus.value)
  router.push({
    name: inProgress ? 'piggyCheerCompose' : 'piggyCheerMessagesManage',
    params: { childId: props.childId, id: props.item.piggyBankId }
  })
}

function goToDetail() {
  router.push({
    name: 'piggyDetail',
    params: { childId: props.childId, id: props.item.piggyBankId }
  })
}

const isActive = computed(() => normalizedStatus.value === 'ACTIVE')

const isCompleted = computed(() =>
  ['ACHIEVE', 'ACHIEVED', 'COMPLETED'].includes(normalizedStatus.value)
)

const bonusStatus = computed(() => String(props.item.bonus?.status ?? '').toUpperCase())

const isBonusPaid = computed(() => ['PAID', 'COMPLETED'].includes(bonusStatus.value))

const remainingAmount = computed(() =>
  Math.max(0, Number(props.item.targetAmount || 0) - Number(props.item.savedAmount || 0))
)

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

function won(amount) {
  return `${Number(amount || 0).toLocaleString('ko-KR')}원`
}

const safeRate = computed(() => {
  const value = Number(props.item.progressRate || 0)
  return Math.min(100, Math.max(0, value))
})

const PROGRESS_COLORS = ['#FF8C69', '#7BC8F5', '#B39DDB']
const progressColor = computed(() => PROGRESS_COLORS[props.index % PROGRESS_COLORS.length])
</script>