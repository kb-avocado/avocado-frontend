<template>
  <div class="piggy-detail">
    <div v-if="!item" class="piggy-detail__empty">
      저금통 정보를 찾을 수 없습니다.
      <button type="button" @click="goBack">목록으로</button>
    </div>

    <article v-else class="piggy-detail__card">
      <header class="piggy-detail__header">
        <span class="piggy-detail__icon">{{ icon }}</span>
        <div>
          <h1>{{ item.name }}</h1>
          <small>{{ item.description || '저금 목표' }}</small>
        </div>
      </header>

      <PiggyBankProgressBar :rate="item.progressRate" />

      <dl class="piggy-detail__info">
        <div>
          <dt>목표 금액</dt>
          <dd>{{ won(item.targetAmount) }}</dd>
        </div>
        <div>
          <dt>진행률</dt>
          <dd>{{ item.progressRate ?? 0 }}%</dd>
        </div>
        <div>
          <dt>상태</dt>
          <dd>{{ statusText }}</dd>
        </div>
      </dl>

      <button type="button" class="piggy-detail__back" @click="goBack">목록으로 돌아가기</button>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePiggyBankStore } from '@/stores/piggyBank'
import PiggyBankProgressBar from '@/components/common/PiggyBankProgressBar.vue'

const route = useRoute()
const router = useRouter()
const store = usePiggyBankStore()

const piggyBankId = computed(() => route.params.id)

const item = computed(() => {
  const target = String(piggyBankId.value)

  // 아이 목록에서 찾기
  for (const tab of Object.keys(store.childLists)) {
    const found = store.childLists[tab].find((piggy) => String(piggy.piggyBankId) === target)
    if (found) return found
  }

  // 보호자 목록에서 찾기 (childId별로 저장돼 있음)
  for (const childKey of Object.keys(store.parentChildren)) {
    const lists = store.parentChildren[childKey]?.lists ?? {}
    for (const tab of Object.keys(lists)) {
      const found = lists[tab].find((piggy) => String(piggy.piggyBankId) === target)
      if (found) return found
    }
  }

  return null
})

const statusText = computed(() => {
  const s = String(item.value?.status ?? '').toUpperCase()
  if (['ACHIEVED', 'COMPLETED'].includes(s)) return '완료'
  if (['CANCELLED', 'CANCELED', 'ABANDONED'].includes(s)) return '중단'
  return '진행 중'
})

const icon = computed(() => {
  const text = `${item.value?.name ?? ''} ${item.value?.description ?? ''}`
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

function goBack() {
  router.back()
}
</script>

<style scoped>
.piggy-detail {
  padding: 22px 20px 36px;
  background: #fff;
  min-height: 100%;
}
.piggy-detail__card {
  display: grid;
  gap: 18px;
}
.piggy-detail__header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.piggy-detail__icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #edf7e5;
  font-size: 24px;
}
.piggy-detail__header h1 {
  margin: 0 0 4px;
  font-size: 20px;
  color: #252a26;
}
.piggy-detail__header small {
  color: #9ca29e;
  font-size: 12px;
}
.piggy-detail__info {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 16px;
  border-radius: 14px;
  background: #f6f8f4;
}
.piggy-detail__info > div {
  display: flex;
  justify-content: space-between;
}
.piggy-detail__info dt {
  color: #777f79;
  font-size: 13px;
  margin: 0;
}
.piggy-detail__info dd {
  margin: 0;
  color: #252a26;
  font-size: 14px;
  font-weight: 700;
}
.piggy-detail__empty {
  min-height: 240px;
  display: grid;
  place-items: center;
  gap: 12px;
  color: #929a94;
  font-size: 13px;
}
.piggy-detail__back {
  padding: 14px;
  border: 0;
  border-radius: 12px;
  background: #78b159;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}
</style>
