<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      >
        <div
          class="w-full max-w-xs rounded-2xl bg-white p-8 flex flex-col items-center gap-3 shadow-lg"
        >
          <div
            class="w-14 h-14 rounded-full flex items-center justify-center"
            :class="isSuccess ? 'bg-avocado-50' : 'bg-red-50'"
          >
            <CheckCircle v-if="isSuccess" :size="28" class="text-avocado-600" />
            <XCircle v-else :size="28" class="text-red-500" />
          </div>
          <p class="text-sm font-medium text-gray-900">{{ message }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import { CheckCircle, XCircle } from 'lucide-vue-next'

// variant: 'success' | 'delete'
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  variant: { type: String, default: 'success' }, // 'success' | 'delete'
  message: { type: String, default: '' },
  autoCloseMs: { type: Number, default: 1200 }
})

const emit = defineEmits(['update:modelValue'])

const isSuccess = computed(() => props.variant === 'success')

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      setTimeout(() => emit('update:modelValue', false), props.autoCloseMs)
    }
  }
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
