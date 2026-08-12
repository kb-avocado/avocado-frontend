<template>
  <article :class="articleClass" @click="goToDetail">
    <header
      class="min-w-0 grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-[11px]"
      :class="{ 'opacity-[0.45]': isCompleted }"
    >
      <span
        class="w-[46px] h-[46px] grid place-items-center rounded-[14px] bg-[#edf7e5] text-[21px]"
        aria-hidden="true"
      >
        {{ icon }}
      </span>

      <div class="min-w-0">
        <h2 class="mb-1 overflow-hidden text-[#252a26] text-base text-ellipsis whitespace-nowrap">
          {{ item.name }}
        </h2>
        <small
          class="block overflow-hidden text-[#9ca29e] text-[10px] text-ellipsis whitespace-nowrap"
        >
          {{ category }}
        </small>
      </div>

      <button
        type="button"
        class="py-[7px] px-[10px] border-0 rounded-full bg-[#eef8e5] text-[#68a34d] text-[9px] font-bold whitespace-nowrap"
        @click.stop="goToCheerMessages"
      >
        보호자님 응원보기
      </button>
    </header>

    <PiggyBankProgressBar
      :rate="item.progressRate"
      :abandoned="isAbandoned"
      :class="{ 'opacity-[0.45]': isCompleted }"
    />

    <section
      v-if="isActive"
      class="relative z-[3] min-h-[62px] py-3 px-[14px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[13px] bg-[#f6f8f4]"
      :class="{ 'opacity-[0.45]': isCompleted }"
    >
      <div class="grid gap-[5px]">
        <small class="text-[#a3a9a4] text-[9px]">남은 금액</small>
        <strong class="text-[#252a26] text-[13px]">{{ won(remainingAmount) }}</strong>
      </div>

      <div class="grid gap-[5px] text-right">
        <small class="text-[#a3a9a4] text-[9px]">목표</small>
        <strong class="text-[#252a26] text-[13px]">{{ won(item.targetAmount) }}</strong>
      </div>
    </section>

    <section
      v-else
      class="relative z-[3] min-h-[62px] py-3 px-[14px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[13px] bg-[#f6f8f4]"
      :class="{ 'opacity-[0.45]': isCompleted }"
      @click.stop
    >
      <div class="grid gap-[5px]">
        <small class="text-[#e47c24] text-[9px] font-bold">보호자님 추가 보너스</small>
        <strong class="text-[13px]" :class="isBonusPaid ? 'text-[#4e9440]' : 'text-[#e47c24]'">
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PiggyBankProgressBar from '@/components/piggy/PiggyBankProgressBar.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  childId: {
    type: [String, Number],
    required: true
  }
})
const router = useRouter()

function goToBonusTransfer() {
  router.push({ name: 'piggyGoalComplete', params: { id: props.item.piggyBankId } })
}

function goToCheerMessages() {
  // 진행중(ACTIVE/PENDING_ACHIEVE) → 응원 작성, 완료(ACHIEVE/CANCEL) → 응원 보기
  const inProgress = ['ACTIVE', 'PENDING_ACHIEVE'].includes(normalizedStatus.value)
  router.push({
    name: inProgress ? 'piggyCheerCompose' : 'piggyCheerMessages',
    params: { id: props.item.piggyBankId }
  })
}
function goToDetail() {
  router.push({
    name: 'piggyDetail',
    params: { childId: props.childId, id: props.item.piggyBankId } // ★ childId 추가
  })
}

const normalizedStatus = computed(() => String(props.item.status ?? '').toUpperCase())

const isActive = computed(() => normalizedStatus.value === 'ACTIVE')

const isCompleted = computed(() =>
  ['ACHIEVE', 'ACHIEVED', 'COMPLETED'].includes(normalizedStatus.value)
)

const isAbandoned = computed(() =>
  ['CANCEL', 'CANCELLED', 'CANCELED', 'ABANDONED'].includes(normalizedStatus.value)
)

// 카드 컨테이너 클래스 (기본 + 상태별)
const articleClass = computed(() => [
  'relative p-[18px] grid gap-[15px] border rounded-[20px] cursor-pointer',
  'shadow-[0_7px_19px_rgba(37,54,42,0.08)]',
  isAbandoned.value ? 'border-[#f1dfcd] bg-[#fffcf8]' : 'border-[#edf0ed] bg-surface'
])

const bonusStatus = computed(() => String(props.item.bonus?.status ?? '').toUpperCase())

const isBonusPaid = computed(() => ['PAID', 'COMPLETED'].includes(bonusStatus.value))

const remainingAmount = computed(() =>
  Math.max(0, Number(props.item.targetAmount || 0) - Number(props.item.savedAmount || 0))
)

const icon = computed(() => {
  // 백엔드에 저장된 아이콘이 있으면 그대로 사용
  if (props.item.icon) return props.item.icon

  // 없으면(아이콘 컬럼 생기기 전 저금통) 이름 기반 추론으로 폴백
  const text = `${props.item.name ?? ''} ${props.item.description ?? ''}`
  if (text.includes('자전거')) return '🚲'
  if (text.includes('책')) return '📚'
  if (text.includes('게임')) return '🎮'
  if (text.includes('여행')) return '🌍'
  if (text.includes('선물')) return '🎁'
  return '🚀'
})

const category = computed(() => props.item.description || '저금 목표')

function won(amount) {
  return `${Number(amount || 0).toLocaleString('ko-KR')}원`
}
</script>
