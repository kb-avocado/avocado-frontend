<template>
  <article
    class="child-piggy-card"
    :class="{
      'child-piggy-card--completed': isCompleted,
      'child-piggy-card--abandoned': isAbandoned
    }"
    @click="goToDetail"
  >
    <header class="child-piggy-card__header">
      <span class="child-piggy-card__icon" aria-hidden="true">
        {{ icon }}
      </span>

      <div class="child-piggy-card__title">
        <h2>{{ item.name }}</h2>

        <small>{{ category }}</small>
      </div>

      <button
        v-if="isActive"
        type="button"
        class="child-piggy-card__favorite"
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

      <button v-else type="button" class="child-piggy-card__cheer" @click.stop="goToCheerMessages">
        부모님 응원보기
      </button>
    </header>

    <PiggyBankProgressBar :rate="item.progressRate" :abandoned="isAbandoned" />

    <section class="child-piggy-card__summary">
      <div>
        <small> 보호자님 추가 보너스 </small>

        <strong>
          {{ bonusText }}
        </strong>
      </div>

      <div class="child-piggy-card__target">
        <small>목표</small>

        <strong>
          {{ won(item.targetAmount) }}
        </strong>
      </div>
    </section>

    <div v-if="isCompleted" class="child-piggy-card__completed-message">저금통 깨기 완료!</div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import PiggyBankProgressBar from '@/components/common/PiggyBankProgressBar.vue'
// 부모님 응원 보기 연결
import { useRouter } from 'vue-router'
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})
// 카드 클릭 연결
function goToDetail() {
  router.push({ name: 'piggyChildDetail', params: { id: props.item.piggyBankId } })
}

//즐겨찾기 버튼 연결
const emit = defineEmits(['toggle-favorite'])

function toggleFavorite() {
  emit('toggle-favorite', props.item)
}

// 부모님 응원 보기 연결
const router = useRouter()

function goToCheerMessages() {
  router.push({
    name: 'piggyCheerMessages',
    params: { id: props.item.piggyBankId }
  })
}
const normalizedStatus = computed(() => String(props.item.status ?? '').toUpperCase())

const isActive = computed(() => normalizedStatus.value === 'ACTIVE')

const isCompleted = computed(() => ['ACHIEVED', 'COMPLETED'].includes(normalizedStatus.value))

const isAbandoned = computed(() =>
  ['CANCELLED', 'CANCELED', 'ABANDONED'].includes(normalizedStatus.value)
)

const bonusStatus = computed(() => String(props.item.bonus?.status ?? '').toUpperCase())

const icon = computed(() => {
  const text = `${props.item.name ?? ''} ` + `${props.item.description ?? ''}`

  if (text.includes('자전거')) {
    return '🚲'
  }

  if (text.includes('책')) {
    return '📚'
  }

  if (text.includes('게임')) {
    return '🎮'
  }

  if (text.includes('여행')) {
    return '🌍'
  }

  if (text.includes('선물')) {
    return '🎁'
  }

  return '🚀'
})

const category = computed(() => props.item.description || '저금 목표')

const bonusText = computed(() => {
  const bonus = props.item.bonus

  if (!bonus) {
    return '미지급'
  }

  if (['PAID', 'COMPLETED'].includes(bonusStatus.value)) {
    return won(bonus.paidAmount ?? bonus.amount ?? calculateRateBonus(bonus))
  }

  const expectedAmount = bonus.amount ?? calculateRateBonus(bonus)

  if (Number(expectedAmount) > 0) {
    return `+${won(expectedAmount)}`
  }

  return '미지급'
})

function calculateRateBonus(bonus) {
  if (String(bonus?.type).toUpperCase() !== 'RATE' || bonus?.rate == null) {
    return 0
  }

  return Math.floor((Number(props.item.targetAmount || 0) * Number(bonus.rate)) / 100)
}

function won(amount) {
  return `${Number(amount || 0).toLocaleString('ko-KR')}원`
}
</script>

<style scoped>
.child-piggy-card {
  position: relative;
  padding: 18px;
  display: grid;
  gap: 15px;
  border: 1px solid #edf0ed;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 7px 19px rgb(37 54 42 / 8%);
}

.child-piggy-card--abandoned {
  border-color: #f1dfcd;
  background: #fffcf8;
}

.child-piggy-card__header {
  min-width: 0;
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
}

.child-piggy-card__icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #edf7e5;
  font-size: 21px;
}

.child-piggy-card__title {
  min-width: 0;
}

.child-piggy-card__title h2 {
  margin: 0 0 4px;
  overflow: hidden;
  color: #252a26;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-piggy-card__title small {
  display: block;
  overflow: hidden;
  color: #9ca29e;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-piggy-card__favorite {
  padding: 7px;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.child-piggy-card__cheer {
  padding: 7px 10px;
  border: 0;
  border-radius: 999px;
  background: #eef8e5;
  color: #68a34d;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.child-piggy-card__summary {
  min-height: 62px;
  padding: 12px 14px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  border-radius: 13px;
  background: #f6f8f4;
}

.child-piggy-card__summary > div {
  display: grid;
  gap: 5px;
}

.child-piggy-card__summary small {
  color: #e47c24;
  font-size: 9px;
  font-weight: 700;
}

.child-piggy-card__summary strong {
  color: #e47c24;
  font-size: 13px;
}

.child-piggy-card__target {
  text-align: right;
}

.child-piggy-card__target small {
  color: #a3a9a4;
}

.child-piggy-card__target strong {
  color: #252a26;
}

.child-piggy-card__completed-message {
  position: absolute;
  z-index: 2;
  top: 52%;
  left: 50%;
  min-width: 140px;
  padding: 12px 15px;
  transform: translate(-50%, -50%);
  border-radius: 11px;
  background: #78b159;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
  box-shadow: 0 6px 14px rgb(91 154 63 / 32%);
}

.child-piggy-card--completed > :not(.child-piggy-card__completed-message) {
  opacity: 0.42;
}
</style>
