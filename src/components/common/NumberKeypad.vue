<template>
  <div class="w-full">
    <div class="grid grid-cols-3">
      <!-- 1 ~ 9 -->
      <button
        v-for="number in NUMBER_KEYS"
        :key="number"
        type="button"
        class="flex h-16 items-center justify-center rounded-xl text-xl font-medium text-gray-900 transition-colors
               active:bg-avocado-100 active:text-avocado-700
               disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled"
        @click="handleInput(number)"
      >
        {{ number }}
      </button>

      <!-- 00 -->
      <button
        type="button"
        class="flex h-16 items-center justify-center rounded-xl text-xl font-medium text-gray-900 transition-colors
               active:bg-avocado-100 active:text-avocado-700
               disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled"
        @click="handleInput('00')"
      >
        00
      </button>

      <!-- 0 -->
      <button
        type="button"
        class="flex h-16 items-center justify-center rounded-xl text-xl font-medium text-gray-900 transition-colors
               active:bg-avocado-100 active:text-avocado-700
               disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled"
        @click="handleInput('0')"
      >
        0
      </button>

      <!-- 한 자리 삭제 -->
      <button
        type="button"
        class="flex h-16 items-center justify-center rounded-xl text-gray-900 transition-colors
               active:bg-avocado-100 active:text-avocado-700
               disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="disabled"
        aria-label="한 자리 지우기"
        @click="handleDelete"
      >
        <Delete :size="22" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Delete } from 'lucide-vue-next'

defineProps({
  mode: {
    type: String,
    default: 'amount'
  },

  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'input',
  'delete'
])

const NUMBER_KEYS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9'
]

function handleInput(value) {
  emit('input', value)
}

function handleDelete() {
  emit('delete')
}
</script>