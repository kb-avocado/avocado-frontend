<template>
  <div class="grid gap-[7px]">
    <div class="flex items-center justify-between">
      <small class="text-[#8f9791] text-[10px]">진행률</small>
      <strong class="text-[13px]" :class="abandoned ? 'text-[#ef8f35]' : 'text-progress-value'">
        {{ safeRate }}%
      </strong>
    </div>

    <div class="w-full h-2 overflow-hidden rounded-full bg-progress-track">
      <div
        class="h-full rounded-full transition-[width] duration-[250ms]"
        :class="abandoned ? 'bg-[#ef963b]' : 'bg-progress-value'"
        :style="{ width: `${safeRate}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rate: {
    type: [Number, String],
    default: 0
  },
  abandoned: {
    type: Boolean,
    default: false
  }
})

const safeRate = computed(() => {
  const value = Number(props.rate || 0)
  return Math.min(100, Math.max(0, value))
})
</script>
