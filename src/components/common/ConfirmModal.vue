<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      @click.self="onCancel"
    >
      <div class="w-full max-w-[300px] rounded-3xl bg-[#F3F4F6] p-6 text-center shadow-xl">
        <h3 class="mb-2 text-base font-bold text-[#191D17]">{{ title }}</h3>
        <p v-if="description" class="text-xs leading-relaxed text-[#43483E]">
          {{ description }}
        </p>

        <div class="flex gap-3 mt-5">
          <button
            type="button"
            class="flex-1 h-10 rounded-full text-sm font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50"
            :class="isDanger ? 'bg-[#BA1A1A]' : 'bg-avocado-600'"
            @click="onConfirm"
          >
            <Trash2 v-if="isDanger" :size="16" />
            {{ confirmText }}
          </button>
          <button
            type="button"
            class="flex-1 h-10 rounded-full bg-[#DFE4D7] text-[#43483E] text-sm font-medium"
            @click="onCancel"
          >
            취소
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
  description: { type: String, default: '' },
  // 확인 버튼 문구를 직접 지정하고 싶을 때만 넘긴다. 비우면 variant 기본값을 쓴다.
  confirmLabel: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isDanger = computed(() => props.variant === 'delete')
const confirmText = computed(
  () => props.confirmLabel || (props.variant === 'delete' ? '삭제' : '저장')
)
function onConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function onCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>
