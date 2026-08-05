<template>
  <div class="space-y-2">
    <label :for="inputId" class="block text-xs font-medium text-gray-600">계좌번호</label>

    <input
      :id="inputId"
      :value="modelValue"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      maxlength="20"
      placeholder="계좌번호 입력"
      class="h-14 w-full rounded-2xl border bg-white px-4 text-sm text-gray-900 shadow-[0_4px_14px_rgba(54,106,27,0.10)] outline-none transition placeholder:text-avocado-600 focus:border-avocado-600 focus:ring-2 focus:ring-avocado-100"
      :class="error ? 'border-red-400' : 'border-transparent'"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      :disabled="disabled"
      @input="handleInput"
      @blur="$emit('blur')"
    />

    <p v-if="error" :id="`${inputId}-error`" class="px-1 text-xs text-red-600" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  inputId: { type: String, default: 'transfer-account-number' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'blur'])

function handleInput(event) {
  const normalizedValue = event.target.value.replace(/\D/g, '').slice(0, 20)
  event.target.value = normalizedValue
  emit('update:modelValue', normalizedValue)
}
</script>
