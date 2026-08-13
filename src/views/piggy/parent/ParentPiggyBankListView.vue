<template>
  <div class="w-full min-h-full pt-[22px] px-5 pb-9 bg-surface">
    <PiggyBankTabs v-model="tab" />

    <section class="mt-[26px] mb-5">
      <h1 class="mb-[7px] text-[#252a26] text-[22px] tracking-[-0.7px]">{{ introTitle }}</h1>
      <p class="text-[#4b534e] text-[13px] leading-[1.55]">{{ introDescription }}</p>
    </section>

    <section
      v-if="error"
      class="p-[14px] flex items-center justify-between gap-3 rounded-[13px] bg-[#fff1ee] text-[#a73e33]"
    >
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

    <section v-else-if="items.length > 0" class="grid gap-[18px]">
      <ParentPiggyBankCard
        v-for="item in items"
        :key="item.piggyBankId"
        :item="item"
        :child-id="childId"
      />
    </section>

    <div
      v-else
      class="min-h-[240px] grid place-items-center rounded-[18px] bg-[#fafcfa] text-[#929a94] text-xs text-center"
    >
      {{ tab === 'IN_PROGRESS' ? '진행 중인 저금통이 없습니다.' : '완료된 저금통이 없습니다.' }}
    </div>
  </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { usePiggyBankStore } from '@/stores/piggyBank'
import PiggyBankTabs from '@/components/piggy/PiggyBankTabs.vue'
import ParentPiggyBankCard from '@/components/piggy/ParentPiggyBankCard.vue'

const props = defineProps({
  childId: {
    type: [String, Number],
    required: true
  }
})

const store = usePiggyBankStore()
const route = useRoute()
const router = useRouter()

const tab = ref(route.query.tab === 'CLOSED' ? 'CLOSED' : 'IN_PROGRESS')
const loading = ref(false)
const error = ref('')

const items = computed(() => store.getParentList(props.childId, tab.value))

const introTitle = computed(() => (tab.value === 'CLOSED' ? '모으기 성공! 🎉' : '아이의 저금 목표'))

const introDescription = computed(() =>
  tab.value === 'CLOSED'
    ? '정말 멋져요, 목표를 다 달성했어요.'
    : '아이의 목표 달성을 응원하는 특별한 선물을 준비해 보세요!'
)

async function load() {
  loading.value = true
  error.value = ''

  try {
    await store.loadParentList(props.childId, tab.value)
  } catch (requestError) {
    error.value = requestError.message || '아이의 저금통 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

// 탭 바뀌면 URL 반영 → 뒤로가기 시 복원
watch(tab, (val) => {
  router.replace({ query: { ...route.query, tab: val } })
})

watch(() => [props.childId, tab.value], load, {
  immediate: true
})
</script>
