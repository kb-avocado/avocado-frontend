<template>
  <div class="max-w-[220px] mx-auto">
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs text-muted">{{ currentStage }}단계 / 5단계</span>
    </div>
  <div class="flex items-center gap-2">
      <div class="w-40 h-4 rounded-full overflow-hidden" style="background-color: #f3f4f6">
        <div
          class="h-full rounded-full transition-[width] duration-700 ease-out"
          :style="{
            backgroundColor: '#96d394',
            width: (revealed ? stageProgress : 0) + '%'
          }"
        ></div>
      </div>
      <span class="text-xs font-semibold text-progress-value shrink-0"
        >{{ Math.round(stageProgress) }}%</span
      >
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  progressRate: { type: [Number, String], default: 0 }
})

const revealed = ref(false)
onMounted(() => {
  requestAnimationFrame(() => {
    revealed.value = true
  })
})

const rate = computed(() => {
  const n = Number(props.progressRate)
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0
})

const currentStage = computed(() => Math.min(5, Math.floor(rate.value / 20) + 1))

const stageProgress = computed(() => {
  const within = ((rate.value - (currentStage.value - 1) * 20) / 20) * 100
  return Math.max(0, Math.min(100, within))
})
</script>