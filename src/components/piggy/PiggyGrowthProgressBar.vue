<template>
  <div class="max-w-[150px] mx-auto">
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs text-muted">{{ currentStage }}단계 / 5단계</span>
      <span class="text-xs font-semibold text-progress-value"
        >{{ Math.round(stageProgress) }}%</span
      >
    </div>
    <div class="w-full h-3 rounded-full bg-progress-track overflow-hidden">
      <div
        class="h-full rounded-full bg-progress-value transition-[width] duration-500"
        :style="{ width: stageProgress + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  progressRate: { type: [Number, String], default: 0 }
})

// 0~100으로 정리
const rate = computed(() => {
  const n = Number(props.progressRate)
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0
})

// 현재 단계 (1~5): 20%마다 다음 단계
const currentStage = computed(() => Math.min(5, Math.floor(rate.value / 20) + 1))

// 현재 단계 안에서의 진행률 (0~100). 단계 넘어가면 0으로 리셋
const stageProgress = computed(() => {
  const within = ((rate.value - (currentStage.value - 1) * 20) / 20) * 100
  return Math.max(0, Math.min(100, within))
})
</script>
