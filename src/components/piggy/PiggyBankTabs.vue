<template>
  <div class="flex items-center gap-2" role="tablist" aria-label="저금통 상태">
    <button
      v-for="t in tabs"
      :key="t.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === t.value"
      class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
      :style="tabStyle(t.value)"
      @click="selectTab(t.value)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const tabs = [
  { value: 'IN_PROGRESS', label: '진행중' },
  { value: 'BONUS_UNPAID', label: '보너스 대기중' },
  { value: 'CLOSED', label: '완료' }
]

function selectTab(tab) {
  emit('update:modelValue', tab)
}

function tabStyle(tab) {
  return props.modelValue === tab
    ? { backgroundColor: '#4C4C4C', border: '1.5px solid #5F5F5F', color: '#FFFFFF' }
    : { backgroundColor: '#FFFFFF', border: '1.5px solid #D1D5DB', color: '#72796B' }
}
</script>
