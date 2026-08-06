<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      @click.self="onCancel"
    >
      <div class="w-full max-w-xs rounded-2xl bg-white p-5 text-center shadow-lg">
        <p class="text-base text-gray-900">{{ title }}</p>
        <p v-if="description" class="text-xs text-muted mt-1">{{ description }}</p>

        <div class="flex gap-2 mt-5">
          <button
            type="button"
            class="flex-1 rounded-xl py-3 text-sm font-medium bg-gray-100 text-gray-500"
            @click="onCancel"
          >
            취소
          </button>
          <button
            type="button"
            class="flex-1 rounded-xl py-3 text-sm font-medium text-white flex items-center justify-center gap-1"
            :class="isDanger ? 'bg-red-500' : 'bg-avocado-600'"
            @click="onConfirm"
          >
            <Trash2 v-if="isDanger" :size="16" />
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'

// variant: 'delete' | 'save' | 'complete'
// delete -> 빨간 버튼 + 휴지통 아이콘 + "삭제"
// save / complete -> 초록 버튼 + "저장"
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  variant: { type: String, default: 'save' }, // 'delete' | 'save' | 'complete'
  title: { type: String, required: true },
  description: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isDanger = computed(() => props.variant === 'delete')
const confirmText = computed(() => (props.variant === 'delete' ? '삭제' : '저장'))

function onConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function onCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
