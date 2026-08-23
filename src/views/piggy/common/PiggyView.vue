<template>
  <div class="w-full min-h-full pt-[22px] px-5 pb-9 bg-surface">
    <div class="mb-5">
      <PiggyBankTabs v-model="tab" />
    </div>

    <Transition name="fade" mode="out-in">
      <section
        v-if="error"
        key="error"
        class="min-h-[72px] p-[14px] grid grid-cols-[auto_1fr_auto] items-center gap-[10px] rounded-2xl bg-[#fff1ee] text-[#a73e33]"
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
        key="loading"
        class="min-h-[240px] grid place-items-center rounded-2xl bg-[#fafcfa] text-[#929a94] text-xs text-center"
      >
        저금통 목록을 불러오는 중입니다.
      </div>

      <section v-else-if="displayedItems.length > 0" key="list" class="grid gap-[18px]">
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
        key="empty"
        class="min-h-[240px] grid place-items-center rounded-2xl bg-[#fafcfa] text-[#929a94] text-xs text-center"
      >
        {{ emptyMessage }}
      </div>
    </Transition>

    <template v-if="tab === 'IN_PROGRESS'">
      <button
        v-if="store.childCanCreate"
        type="button"
        class="w-full min-h-[76px] mt-5 grid place-items-center content-center gap-[3px] border-[1.5px] border-dashed border-[#dce5dc] rounded-2xl bg-surface text-[#9ba49d] text-[11px]"
        @click="goToCreate"
      >
        <span aria-hidden="true" class="text-[21px]">＋</span>
        새로운 저금통 만들기
      </button>

      <p class="mt-[25px] text-xs text-muted leading-relaxed text-center">
        저금통은 {{ store.childMaxCount }}개까지 만들 수 있어요.
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

const displayedItems = computed(() => store.getChildList(tab.value))

const emptyMessage = computed(() => {
  if (tab.value === 'IN_PROGRESS') return '진행 중인 저금통이 없습니다.'
  if (tab.value === 'BONUS_UNPAID') return '보너스 대기중인 저금통이 없습니다.'
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

// 탭을 빠르게 연속으로 누르면 먼저 보낸 요청이 나중에 응답할 수 있으므로,
// 가장 최근 요청의 결과만 반영하도록 순번으로 걸러낸다.
let requestSequence = 0

async function load() {
  const currentSequence = ++requestSequence
  loading.value = true
  error.value = ''
  try {
    await store.loadChildList(tab.value)
    if (currentSequence !== requestSequence) return
  } catch (requestError) {
    if (currentSequence !== requestSequence) return
    error.value = requestError.message || '저금통 목록을 불러오지 못했습니다.'
  } finally {
    if (currentSequence === requestSequence) loading.value = false
  }
}

watch(tab, (val) => {
  router.replace({ query: { ...route.query, tab: val } })
})

watch(tab, load, { immediate: true })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
