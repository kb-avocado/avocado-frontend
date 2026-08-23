<template>
  <div class="h-full min-h-0 flex flex-col overflow-y-auto">
    <NewsListBody
      class="flex-1 min-h-0"
      detail-route-name="newspaper-detail"
    />
  </div>
</template>

<script setup>
import NewsListBody from '@/components/news/NewsListBody.vue'
</script>