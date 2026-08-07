<template>
  <div
    class="grid grid-cols-3 gap-x-3"
    :class="mode === 'pin' ? 'gap-y-5' : 'gap-y-3'"
    role="group"
    :aria-label="mode === 'pin' ? '비밀번호 숫자 키패드' : '금액 숫자 키패드'"
  >
    <!-- 1~9 -->
    <button
      v-for="key in keys"
      :key="key"
      type="button"
      :class="keyButtonClass"
      :aria-label="`${key} 입력`"
      :disabled="disabled"
      @click="emit('input', String(key))"
    >
      {{ key }}
    </button>

    <!-- 왼쪽 아래: 00 또는 취소 -->
    <button
      type="button"
      :class="keyButtonClass"
      :aria-label="mode === 'pin' ? '입력 취소' : '00 입력'"
      :disabled="disabled"
      @click="handleLeftButton"
    >
      <X v-if="mode === 'pin'" class="h-6 w-6" aria-hidden="true" />

      <span v-else>00</span>
    </button>

    <!-- 0 -->
    <button
      type="button"
      :class="keyButtonClass"
      aria-label="0 입력"
      :disabled="disabled"
      @click="emit('input', '0')"
    >
      0
    </button>

    <!-- 삭제 -->
    <button
      type="button"
      :class="keyButtonClass"
      aria-label="한 자리 지우기"
      :disabled="disabled"
      @click="emit('delete')"
    >
      <Delete class="h-6 w-6" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Delete, X } from 'lucide-vue-next'

const props = defineProps({
  mode: {
    type: String,
    default: 'amount',
    validator: (value) => ['amount', 'pin'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits({
  input: (value) => ['0', '00', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(value),
  delete: () => true,
  cancel: () => true
})

const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const keyButtonClass = computed(() => [
  'flex items-center justify-center rounded-2xl text-gray-900',
  'transition-colors duration-0 hover:bg-avocado-100 active:bg-avocado-300 active:duration-0',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-avocado-600',
  'disabled:cursor-not-allowed disabled:opacity-40',
  props.mode === 'pin' ? 'h-16 text-3xl font-bold' : 'h-14 text-base font-normal'
])

const handleLeftButton = () => {
  if (props.mode === 'pin') {
    emit('cancel')
    return
  }

  emit('input', '00')
}
</script>
