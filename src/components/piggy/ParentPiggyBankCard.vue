<template>
  <article
    class="parent-piggy-card"
    :class="{
      'parent-piggy-card--completed': isCompleted,
      'parent-piggy-card--abandoned': isAbandoned
    }"
    @click="goToDetail"
  >
    <header class="parent-piggy-card__header">
      <span class="parent-piggy-card__icon" aria-hidden="true">
        {{ icon }}
      </span>

      <div class="parent-piggy-card__title">
        <h2>{{ item.name }}</h2>

        <small>{{ category }}</small>
      </div>

      <button type="button" class="parent-piggy-card__cheer" @click.stop="goToCheerMessages">
        보호자님 응원보기
      </button>
    </header>

    <PiggyBankProgressBar :rate="item.progressRate" :abandoned="isAbandoned" />

    <section v-if="isActive" class="parent-piggy-card__amounts">
      <div>
        <small>남은 금액</small>

        <strong>
          {{ won(remainingAmount) }}
        </strong>
      </div>

      <div class="parent-piggy-card__target">
        <small>목표</small>

        <strong>
          {{ won(item.targetAmount) }}
        </strong>
      </div>
    </section>

    <section v-else class="parent-piggy-card__bonus" @click.stop>
      <div>
        <small> 보호자님 추가 보너스 </small>

        <strong
          :class="{
            'parent-piggy-card__paid': isBonusPaid
          }"
        >
          {{ isBonusPaid ? '지급 완료' : '미지급' }}
        </strong>
      </div>

      <button
        type="button"
        class="parent-piggy-card__bonus-button"
        :disabled="isBonusPaid || isAbandoned"
        @click.stop="goToBonusTransfer"
      >
        보너스 송금
      </button>
    </section>

    <div v-if="isCompleted" class="parent-piggy-card__completed-message">저금통 깨기 완료!</div>
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
const router = useRouter()

//보너스 송금 버튼 연결
function goToBonusTransfer() {
  router.push({ name: 'piggyGoalComplete', params: { id: props.item.piggyBankId } })
}

// 응원 보기 버튼 연결
function goToCheerMessages() {
  router.push({ name: 'piggyCheerMessages', params: { id: props.item.piggyBankId } })
}
// 저금통 상세 화면 연결
function goToDetail() {
  router.push({ name: 'piggyDetail', params: { id: props.item.piggyBankId } })
}
const normalizedStatus = computed(() => String(props.item.status ?? '').toUpperCase())

const isActive = computed(() => normalizedStatus.value === 'ACTIVE')

const isCompleted = computed(() => ['ACHIEVED', 'COMPLETED'].includes(normalizedStatus.value))

const isAbandoned = computed(() =>
  ['CANCELLED', 'CANCELED', 'ABANDONED'].includes(normalizedStatus.value)
)

const bonusStatus = computed(() => String(props.item.bonus?.status ?? '').toUpperCase())

const isBonusPaid = computed(() => ['PAID', 'COMPLETED'].includes(bonusStatus.value))

const remainingAmount = computed(() =>
  Math.max(0, Number(props.item.targetAmount || 0) - Number(props.item.savedAmount || 0))
)

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

function won(amount) {
  return `${Number(amount || 0).toLocaleString('ko-KR')}원`
}
</script>

<style scoped>
.parent-piggy-card {
  position: relative;
  padding: 18px;
  display: grid;
  gap: 15px;
  border: 1px solid #edf0ed;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 7px 19px rgb(37 54 42 / 8%);
  cursor: pointer;
}

.parent-piggy-card--abandoned {
  border-color: #f1dfcd;
  background: #fffcf8;
}

.parent-piggy-card__header {
  min-width: 0;
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
}

.parent-piggy-card__icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #edf7e5;
  font-size: 21px;
}

.parent-piggy-card__title {
  min-width: 0;
}

.parent-piggy-card__title h2 {
  margin: 0 0 4px;
  overflow: hidden;
  color: #252a26;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.parent-piggy-card__title small {
  display: block;
  overflow: hidden;
  color: #9ca29e;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.parent-piggy-card__cheer {
  padding: 7px 10px;
  border: 0;
  border-radius: 999px;
  background: #eef8e5;
  color: #68a34d;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.parent-piggy-card__amounts,
.parent-piggy-card__bonus {
  position: relative;
  z-index: 3;
  min-height: 62px;
  padding: 12px 14px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  border-radius: 13px;
  background: #f6f8f4;
}

.parent-piggy-card__amounts > div,
.parent-piggy-card__bonus > div {
  display: grid;
  gap: 5px;
}

.parent-piggy-card__amounts small {
  color: #a3a9a4;
  font-size: 9px;
}

.parent-piggy-card__amounts strong {
  color: #252a26;
  font-size: 13px;
}

.parent-piggy-card__target {
  text-align: right;
}

.parent-piggy-card__bonus small {
  color: #e47c24;
  font-size: 9px;
  font-weight: 700;
}

.parent-piggy-card__bonus strong {
  color: #e47c24;
  font-size: 13px;
}

.parent-piggy-card__paid {
  color: #4e9440 !important;
}

.parent-piggy-card__bonus-button {
  min-width: 91px;
  height: 38px;
  border: 0;
  border-radius: 10px;
  background: #78b159;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.parent-piggy-card__bonus-button:disabled {
  background: #dcead5;
  box-shadow: none;
}

.parent-piggy-card__completed-message {
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

.parent-piggy-card--completed > :not(.parent-piggy-card__completed-message) {
  opacity: 0.45;
}
</style>
