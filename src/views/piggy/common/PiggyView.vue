<template>
  <div class="w-full min-h-full pt-[22px] px-5 pb-9 bg-surface">
    <div class="mb-5">
      <PiggyBankTabs v-model="tab" />
    </div>

    <section
      v-if="error"
      class="min-h-[72px] p-[14px] grid grid-cols-[auto_1fr_auto] items-center gap-[10px] rounded-[13px] bg-[#fff1ee] text-[#a73e33]"
    >
      <span aria-hidden="true">!</span>
      <p class="text-xs">{{ error }}</p>
      <button
        type="button"
        class="py-2 px-[10px] border-0 rounded-lg bg-[#a73e33] text-white text-[11px]"
        @click="load"
      >
        다시 시도
      </button>
    </section>

    <div
      v-else-if="loading"
      class="min-h-[240px] grid place-items-center rounded-[18px] bg-[#fafcfa] text-[#929a94] text-xs text-center"
    >
      저금통 목록을 불러오는 중입니다.
    </div>

    <section v-else-if="displayedItems.length > 0" class="grid gap-[18px]">
      <ChildPiggyBankCard
        v-for="(item, index) in displayedItems"
        :key="item.piggyBankId"
        :item="item"
        :index="index"
        @toggle-favorite="onToggleFavorite"
      />
    </section>

    <div
      v-else
      class="min-h-[240px] grid place-items-center rounded-[18px] bg-[#fafcfa] text-[#929a94] text-xs text-center"
    >
      {{ emptyMessage }}
    </div>

    <template v-if="tab === 'IN_PROGRESS'">
      <button
        v-if="store.childCanCreate"
        type="button"
        class="w-full min-h-[76px] mt-5 grid place-items-center content-center gap-[3px] border-[1.5px] border-dashed border-[#dce5dc] rounded-[18px] bg-surface text-[#9ba49d] text-[11px]"
        @click="goToCreate"
      >
        <span aria-hidden="true" class="text-[21px]">＋</span>
        새로운 저금 목표 추가하기
      </button>

      <p class="mt-[25px] text-xs text-muted leading-relaxed text-center">
        저금 목표는 최대 {{ store.childMaxCount }}개까지 만들 수 있어요.
        <strong class="text-gray-600"
          >(현재 {{ store.childActiveCount }}/{{ store.childMaxCount }})</strong
        >
      </p>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import { usePiggyBankStore } from '@/stores/piggyBank'
import PiggyBankTabs from '@/components/piggy/PiggyBankTabs.vue'
import ChildPiggyBankCard from '@/components/piggy/ChildPiggyBankCard.vue'

import { useRoute, useRouter } from 'vue-router'

const store = usePiggyBankStore()
const route = useRoute()
const router = useRouter()

const VALID_TABS = ['IN_PROGRESS', 'BONUS_UNPAID', 'CLOSED']
const tab = ref(VALID_TABS.includes(route.query.tab) ? route.query.tab : 'IN_PROGRESS')
const loading = ref(false)
const error = ref('')

// 프론트 필터 헬퍼
const isAchieve = (p) => String(p.status ?? '').toUpperCase() === 'ACHIEVE'
const hasBonus = (p) => String(p.bonus?.type ?? 'NONE').toUpperCase() !== 'NONE'
const isPaid = (p) => String(p.bonus?.status ?? '').toUpperCase() === 'PAID'

// 탭 → 백엔드 조회 그룹 (보너스미지급/완료는 둘 다 CLOSED로 조회)
const backendTab = (t) => (t === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'CLOSED')

const displayedItems = computed(() => {
  if (tab.value === 'IN_PROGRESS') {
    return store.getChildList('IN_PROGRESS')
  }
  const closed = store.getChildList('CLOSED')
  if (tab.value === 'BONUS_UNPAID') {
    return closed.filter((p) => isAchieve(p) && hasBonus(p) && !isPaid(p)) // c
  }
  return closed.filter((p) => isAchieve(p) && (isPaid(p) || !hasBonus(p))) // d = 완료
})

const emptyMessage = computed(() => {
  if (tab.value === 'IN_PROGRESS') return '진행 중인 저금통이 없습니다.'
  if (tab.value === 'BONUS_UNPAID') return '보너스 미지급 저금통이 없습니다.'
  return '완료된 저금통이 없습니다.'
})

function goToCreate() {
  router.push({ name: 'piggyCreate' })
}

async function onToggleFavorite(item) {
  try {
    await store.toggleFavorite(item.piggyBankId)
  } catch {
    // 즐겨찾기 토글 실패는 조용히 무시
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    await store.loadChildList(backendTab(tab.value))
  } catch (requestError) {
    error.value = requestError.message || '저금통 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

// 탭 바뀌면 URL 반영
watch(tab, (val) => {
  router.replace({ query: { ...route.query, tab: val } })
})

// 백엔드 조회 그룹이 바뀔 때만 재조회 (보너스미지급 ↔ 완료는 같은 CLOSED라 재조회 안 함)
watch(() => backendTab(tab.value), load, { immediate: true })
</script>
