<template>
  <NoChildConnected v-if="!hasChildren" />

  <div v-else class="w-full min-h-full pt-[22px] px-5 pb-9 bg-surface">
    <CurrentChildBadge :name="currentChildName" :avatar-image="currentChildAvatarImage" />

    <div class="mt-[26px] mb-5">
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
      <ParentPiggyBankCard
        v-for="(item, index) in displayedItems"
        :key="item.piggyBankId"
        :item="item"
        :index="index"
        :child-id="resolvedChildId"
      />
    </section>

    <div
      v-else
      class="min-h-[240px] grid place-items-center rounded-[18px] bg-[#fafcfa] text-[#929a94] text-xs text-center"
    >
      {{ emptyMessage }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { usePiggyBankStore } from '@/stores/piggyBank'
import PiggyBankTabs from '@/components/piggy/PiggyBankTabs.vue'
import ParentPiggyBankCard from '@/components/piggy/ParentPiggyBankCard.vue'
import CurrentChildBadge from '@/components/common/CurrentChildBadge.vue'
import NoChildConnected from '@/components/common/NoChildConnected.vue'
import { useCurrentChildInfo } from '@/composables/useCurrentChildInfo'
import { useAuthStore } from '@/stores/auth'
import { resolveParentChildId } from '@/router/landing'

const props = defineProps({
  childId: {
    type: [String, Number],
    default: ''
  }
})

const authStore = useAuthStore()
const hasChildren = computed(() => (authStore.user?.child ?? []).length > 0)

const resolvedChildId = computed(() =>
  String(props.childId || resolveParentChildId(authStore.user) || '')
)

const { name: currentChildName, avatarImage: currentChildAvatarImage } =
  useCurrentChildInfo(resolvedChildId)

const store = usePiggyBankStore()
const route = useRoute()
const router = useRouter()

const VALID_TABS = ['IN_PROGRESS', 'BONUS_UNPAID', 'CLOSED']
const tab = ref(VALID_TABS.includes(route.query.tab) ? route.query.tab : 'IN_PROGRESS')
const loading = ref(false)
const error = ref('')

const displayedItems = computed(() => store.getParentList(resolvedChildId.value, tab.value))

const emptyMessage = computed(() => {
  if (tab.value === 'IN_PROGRESS') return '진행 중인 저금통이 없습니다.'
  if (tab.value === 'BONUS_UNPAID') return '보너스 대기중인 저금통이 없습니다.'
  return '완료된 저금통이 없습니다.'
})

async function load() {
  if (!hasChildren.value) return
  loading.value = true
  error.value = ''
  try {
    await store.loadParentList(resolvedChildId.value, tab.value)
  } catch (requestError) {
    error.value = requestError.message || '아이의 저금통 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

watch(tab, (val) => {
  router.replace({ query: { ...route.query, tab: val } })
})

watch(() => [resolvedChildId.value, tab.value], load, { immediate: true })
</script>
