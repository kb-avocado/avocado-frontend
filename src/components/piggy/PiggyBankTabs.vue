<template>
  <div class="flex items-center gap-2" role="tablist" aria-label="저금통 상태">
    <button
      type="button"
      role="tab"
      :aria-selected="modelValue === 'IN_PROGRESS'"
      class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
      :style="tabStyle('IN_PROGRESS')"
      @click="selectTab('IN_PROGRESS')"
    >
      진행중
    </button>

    <button
      type="button"
      role="tab"
      :aria-selected="modelValue === 'CLOSED'"
      class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
      :style="tabStyle('CLOSED')"
      @click="selectTab('CLOSED')"
    >
      완료
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

function selectTab(tab) {
  emit('update:modelValue', tab)
}

function tabStyle(tab) {
  return props.modelValue === tab
    ? { backgroundColor: '#4C4C4C', border: '1.5px solid #5F5F5F', color: '#FFFFFF' }
    : { backgroundColor: '#FFFFFF', border: '1.5px solid #D1D5DB', color: '#72796B' }
}
</script>