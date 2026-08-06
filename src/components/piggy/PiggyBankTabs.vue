<template>
  <div
    class="w-full h-[46px] p-1 grid grid-cols-2 rounded-[24px] bg-[#f2f3f4]"
    role="tablist"
    aria-label="저금통 상태"
  >
    <button
      type="button"
      role="tab"
      :aria-selected="modelValue === 'IN_PROGRESS'"
      :class="tabClass('IN_PROGRESS')"
      @click="selectTab('IN_PROGRESS')"
    >
      진행중
    </button>

    <button
      type="button"
      role="tab"
      :aria-selected="modelValue === 'CLOSED'"
      :class="tabClass('CLOSED')"
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

// 탭 버튼 클래스 (기본 + 활성/비활성)
function tabClass(tab) {
  return [
    'border-0 rounded-[21px] text-xs font-bold cursor-pointer',
    props.modelValue === tab
      ? 'bg-surface text-[#252a26] shadow-[0_2px_6px_rgba(33,49,39,0.1)]'
      : 'bg-transparent text-[var(--color-text-secondary)]'
  ]
}
</script>
