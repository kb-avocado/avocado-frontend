<template>
  <article :class="articleClass" @click="goToDetail">
    <header
      class="min-w-0 grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-[11px]"
      :class="{ 'opacity-[0.42]': isCompleted }"
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
        v-if="isActive"
        type="button"
        class="p-[7px] border-0 bg-transparent cursor-pointer"
        :aria-pressed="Boolean(item.favorite)"
        :aria-label="item.favorite ? '즐겨찾기 등록됨' : '즐겨찾기 등록 안 됨'"
        @click.stop="toggleFavorite"
      >
        <svg
          width="20"
          height="19"
          viewBox="0 0 20 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 18.35L8.55 17.05C6.86667 15.5333 5.475 14.225 4.375 13.125C3.275 12.025 2.4 11.0375 1.75 10.1625C1.1 9.2875 0.645833 8.48333 0.3875 7.75C0.129167 7.01667 0 6.26667 0 5.5C0 3.93333 0.525 2.625 1.575 1.575C2.625 0.525 3.93333 0 5.5 0C6.36667 0 7.19167 0.183333 7.975 0.55C8.75833 0.916667 9.43333 1.43333 10 2.1C10.5667 1.43333 11.2417 0.916667 12.025 0.55C12.8083 0.183333 13.6333 0 14.5 0C16.0667 0 17.375 0.525 18.425 1.575C19.475 2.625 20 3.93333 20 5.5C20 6.26667 19.8708 7.01667 19.6125 7.75C19.3542 8.48333 18.9 9.2875 18.25 10.1625C17.6 11.0375 16.725 12.025 15.625 13.125C14.525 14.225 13.1333 15.5333 11.45 17.05L10 18.35Z"
            :fill="item.favorite ? '#FF4B4B' : '#989898'"
          />
        </svg>
      </button>

      <button
        v-else
        type="button"
        class="py-[7px] px-[10px] border-0 rounded-full bg-[#eef8e5] text-[#68a34d] text-[9px] font-bold whitespace-nowrap"
        @click.stop="goToCheerMessages"
      >
        부모님 응원보기
      </button>
    </header>

    <PiggyBankProgressBar
      :rate="item.progressRate"
      :abandoned="isAbandoned"
      :class="{ 'opacity-[0.42]': isCompleted }"
    />

    <section
      class="min-h-[62px] py-3 px-[14px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[13px] bg-[#f6f8f4]"
      :class="{ 'opacity-[0.42]': isCompleted }"
    >
      <div class="grid gap-[5px]">
        <small class="text-[#e47c24] text-[9px] font-bold">보호자님 추가 보너스</small>
        <strong class="text-[#e47c24] text-[13px]">{{ bonusText }}</strong>
      </div>

      <div class="grid gap-[5px] text-right">
        <small class="text-[#a3a9a4] text-[9px] font-bold">목표</small>
        <strong class="text-[#252a26] text-[13px]">{{ won(item.targetAmount) }}</strong>
      </div>
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
  }
})

const emit = defineEmits(['toggle-favorite'])

const router = useRouter()

function goToDetail() {
  router.push({ name: 'piggyChildDetail', params: { id: props.item.piggyBankId } })
}

function toggleFavorite() {
  emit('toggle-favorite', props.item)
}

function goToCheerMessages() {
  router.push({ name: 'piggyCheerMessages', params: { id: props.item.piggyBankId } })
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
  'relative p-[18px] grid gap-[15px] border rounded-[20px]',
  'shadow-[0_7px_19px_rgba(37,54,42,0.08)]',
  isAbandoned.value ? 'border-[#f1dfcd] bg-[#fffcf8]' : 'border-[#edf0ed] bg-surface'
])

const bonusStatus = computed(() => String(props.item.bonus?.status ?? '').toUpperCase())

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

const bonusText = computed(() => {
  const bonus = props.item.bonus
  if (!bonus) return '미지급'

  if (['PAID', 'COMPLETED'].includes(bonusStatus.value)) {
    return won(bonus.paidAmount ?? bonus.amount ?? calculateRateBonus(bonus))
  }

  const expectedAmount = bonus.amount ?? calculateRateBonus(bonus)
  if (Number(expectedAmount) > 0) return `+${won(expectedAmount)}`
  return '미지급'
})

function calculateRateBonus(bonus) {
  if (String(bonus?.type).toUpperCase() !== 'RATE' || bonus?.rate == null) return 0
  return Math.floor((Number(props.item.targetAmount || 0) * Number(bonus.rate)) / 100)
}

function won(amount) {
  return `${Number(amount || 0).toLocaleString('ko-KR')}원`
}
</script>
