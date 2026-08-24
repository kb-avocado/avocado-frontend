<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      >
        <div
          class="w-full max-w-[300px] rounded-3xl bg-white p-6 text-center shadow-xl"
        >
          <!-- 캐릭터 이미지 -->
          <img
            :src="modalImage"
            alt=""
            aria-hidden="true"
            class="w-28 h-28 mx-auto mb-3 object-contain"
          />

          <!-- 제목 -->
          <h3
            v-if="title"
            class="text-lg font-bold text-gray-900"
          >
            {{ title }}
          </h3>

          <!-- 결과 메시지 -->
          <p
            v-if="message"
            class="mt-2 text-sm leading-relaxed text-gray-600"
          >
            {{ message }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import {
  computed,
  watch,
  onBeforeUnmount
} from 'vue'

import positiveAvocadoImage from '@/assets/images/cheer.png'
import negativeAvocadoImage from '@/assets/images/ch25.png'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },

  /*
   * success
   * → 긍정 이미지
   *
   * error / delete / danger
   * → 슬픈 이미지
   */
  variant: {
    type: String,
    default: 'success'
  },

  title: {
    type: String,
    default: ''
  },

  message: {
    type: String,
    default: ''
  },

  autoCloseMs: {
    type: Number,
    default: 1500
  }
})

const emit = defineEmits([
  'update:modelValue'
])

let timer = null

const isNegative = computed(() =>
  ['error', 'delete', 'danger'].includes(
    props.variant
  )
)

const modalImage = computed(() =>
  isNegative.value
    ? negativeAvocadoImage
    : positiveAvocadoImage
)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    if (
      isOpen &&
      props.autoCloseMs > 0
    ) {
      timer = setTimeout(() => {
        emit(
          'update:modelValue',
          false
        )

        timer = null
      }, props.autoCloseMs)
    }
  }
)

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
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