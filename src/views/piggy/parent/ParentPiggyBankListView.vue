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

    <section v-else-if="items.length > 0" class="grid gap-[18px]">
      <ParentPiggyBankCard
        v-for="(item, index) in items"
        :key="item.piggyBankId"
        :item="item"
        :index="index"
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
import CurrentChildBadge from '@/components/common/CurrentChildBadge.vue'
import NoChildConnected from '@/components/common/NoChildConnected.vue'
import { useCurrentChildInfo } from '@/composables/useCurrentChildInfo'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  // 연결된 아이가 없는 부모는 childId 없이 이 화면에 들어온다.
  childId: {
    type: [String, Number],
    default: ''
  }
})

const authStore = useAuthStore()
const hasChildren = computed(() => (authStore.user?.child ?? []).length > 0)

const { name: currentChildName, avatarImage: currentChildAvatarImage } = useCurrentChildInfo(
  computed(() => props.childId)
)

const store = usePiggyBankStore()
const route = useRoute()
const router = useRouter()

const tab = ref(route.query.tab === 'CLOSED' ? 'CLOSED' : 'IN_PROGRESS')
const loading = ref(false)
const error = ref('')

const items = computed(() => store.getParentList(props.childId, tab.value))

async function load() {
  if (!hasChildren.value) return

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