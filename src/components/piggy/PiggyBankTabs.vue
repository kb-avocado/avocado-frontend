<template>
  <div class="piggy-tabs" role="tablist" aria-label="저금통 상태">
    <button
      type="button"
      role="tab"
      :aria-selected="modelValue === 'IN_PROGRESS'"
      :class="{ active: modelValue === 'IN_PROGRESS' }"
      @click="selectTab('IN_PROGRESS')"
    >
      진행중
    </button>

    <button
      type="button"
      role="tab"
      :aria-selected="modelValue === 'CLOSED'"
      :class="{ active: modelValue === 'CLOSED' }"
      @click="selectTab('CLOSED')"
    >
      완료
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

function selectTab(tab) {
  emit('update:modelValue', tab)
}
</script>

<style scoped>
.piggy-tabs {
  width: 100%;
  height: 46px;
  padding: 4px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 24px;
  background: #f2f3f4;
}

.piggy-tabs button {
  border: 0;
  border-radius: 21px;
  background: transparent;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.piggy-tabs button.active {
  background: #fff;
  color: #252a26;
  box-shadow: 0 2px 6px rgb(33 49 39 / 10%);
}
</style>
