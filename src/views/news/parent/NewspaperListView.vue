<template>
  <div>
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
import { useCurrentChildInfo } from '@/composables/useCurrentChildInfo'

const props = defineProps({
  childId: {
    type: [String, Number],
    required: true
  }
})

const { name: currentChildName, avatarImage: currentChildAvatarImage } = useCurrentChildInfo(
  computed(() => props.childId)
)
</script>