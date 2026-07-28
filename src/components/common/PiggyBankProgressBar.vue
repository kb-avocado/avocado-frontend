<template>
  <div class="progress-wrapper">
    <div class="progress-label">
      <small>진행률</small>
      <strong :class="{ abandoned }"> {{ safeRate }}% </strong>
    </div>

    <div class="progress-track">
      <div class="progress-value" :class="{ abandoned }" :style="{ width: `${safeRate}%` }"></div>
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

<style scoped>
.progress-wrapper {
  display: grid;
  gap: 7px;
}

.progress-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-label small {
  color: #8f9791;
  font-size: 10px;
}

.progress-label strong {
  color: #3d7837;
  font-size: 13px;
}

.progress-label strong.abandoned {
  color: #ef8f35;
}

.progress-track {
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #eef0e7;
}

.progress-value {
  height: 100%;
  border-radius: inherit;
  background: #39772f;
  transition: width 0.25s ease;
}

.progress-value.abandoned {
  background: #ef963b;
}
</style>
