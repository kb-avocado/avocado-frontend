<template>
  <div class="space-y-2">
    <label :for="inputId" class="block text-xs font-medium text-gray-600">은행</label>

    <div class="relative">
      <Landmark
        class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
        aria-hidden="true"
      />
      <select
        :id="inputId"
        :value="modelValue"
        class="h-14 w-full appearance-none rounded-2xl border border-transparent bg-white pl-12 pr-11 text-sm font-medium text-gray-800 shadow-[0_4px_14px_rgba(54,106,27,0.10)] outline-none transition focus:border-avocado-600 focus:ring-2 focus:ring-avocado-100"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        :disabled="disabled"
        @change="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur')"
      >
        <option value="" disabled>은행 선택</option>
        <option v-for="bank in banks" :key="bank.code" :value="bank.code">
          {{ bank.name }}
        </option>
      </select>
      <ChevronDown
        class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
        aria-hidden="true"
      />
    </div>

    <p v-if="error" :id="`${inputId}-error`" class="px-1 text-xs text-red-600" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ChevronDown, Landmark } from 'lucide-vue-next'

defineProps({
  modelValue: { type: String, default: '' },
  banks: { type: Array, required: true },
  inputId: { type: String, default: 'transfer-bank' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})

defineEmits(['update:modelValue', 'blur'])
</script>
