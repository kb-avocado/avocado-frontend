<template>
  <ul class="overflow-hidden rounded-2xl bg-white shadow-sm">
    <li v-for="(item, index) in items" :key="item.key">
      <button
        type="button"
        class="flex w-full items-center gap-3 px-5 py-4 text-left"
        :class="index > 0 ? 'border-t border-gray-100' : ''"
      >
        <component :is="item.icon" :size="20" class="shrink-0 text-avocado-600" />
        <span class="flex-1 truncate text-sm font-medium text-gray-900">{{ item.label }}</span>
        <ChevronRight :size="16" class="shrink-0 text-muted" />
      </button>
    </li>
  </ul>
</template>

<script setup>
import { ChevronRight } from 'lucide-vue-next'

defineProps({
  items: {
    type: Array, // [{ key, label, icon }]
    required: true
  }
})
</script>
