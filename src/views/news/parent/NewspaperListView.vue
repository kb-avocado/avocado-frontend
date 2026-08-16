<template>
  <NoChildConnected v-if="!hasChildren" />

  <div v-else>
    <div class="px-4 pt-4">
      <CurrentChildBadge :name="currentChildName" :avatar-image="currentChildAvatarImage" />
    </div>

    <NewsListBody :child-id="childId" detail-route-name="parent-newspaper-detail" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import NewsListBody from '@/components/news/NewsListBody.vue'
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
</script>