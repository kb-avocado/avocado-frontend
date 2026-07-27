<template>
  <button
    type="button"
    class="inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:opacity-40"
    :class="[sizeClass, variantClass]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary | outline | ghost
  },
  size: {
    type: String,
    default: 'md', // sm | md
  },
  disabled: { type: Boolean, default: false },
})

const variantClass = computed(() => ({
  primary: 'bg-avocado-600 text-white hover:opacity-90',
  outline: 'border border-avocado-300 text-avocado-600 hover:bg-avocado-50',
  ghost: 'text-avocado-600 hover:bg-avocado-50',
}[props.variant]))

const sizeClass = computed(() => ({
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-[14px]',
}[props.size]))
</script>
