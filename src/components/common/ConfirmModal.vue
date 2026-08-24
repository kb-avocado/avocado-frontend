<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
        @click.self="onCancel"
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
          <h3 class="text-lg font-bold text-gray-900">
            {{ title }}
          </h3>

          <!-- 일반 설명 -->
          <p
            v-if="description && !highlight"
            class="mt-2 text-sm leading-relaxed text-gray-600"
          >
            {{ description }}
          </p>

          <!-- 일부 강조가 필요한 설명 -->
          <p
            v-else-if="highlight"
            class="mt-2 text-sm leading-relaxed text-gray-600"
          >
            {{ descriptionPrefix }}

            <strong
              :class="
                isDanger
                  ? 'font-bold text-red-500'
                  : 'font-bold text-avocado-700'
              "
            >
              {{ highlight }}
            </strong>

            {{ descriptionSuffix }}
          </p>

          <!-- 버튼 -->
          <div class="mt-5 flex gap-3">
            <!-- 취소 -->
            <button
              type="button"
              class="flex h-11 flex-1 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
              @click="onCancel"
            >
              {{ cancelText }}
            </button>

            <!-- 확인 -->
            <button
              type="button"
              class="flex h-11 flex-1 items-center justify-center rounded-full text-sm font-bold text-white transition disabled:opacity-50"
              :class="
                isDanger
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-avocado-600 hover:bg-avocado-700'
              "
              @click="onConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

import positiveAvocadoImage from '@/assets/images/cheer.png'
import negativeAvocadoImage from '@/assets/images/ch25.png'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },

  /*
   * save / complete / confirm
   * → 긍정 이미지 + 초록 버튼
   *
   * delete / danger
   * → 슬픈 이미지 + 빨간 버튼
   */
  variant: {
    type: String,
    default: 'save'
  },

  title: {
    type: String,
    required: true
  },

  // 일반 설명
  description: {
    type: String,
    default: ''
  },

  // 강조 문구 앞부분
  descriptionPrefix: {
    type: String,
    default: ''
  },

  // 강조할 부분
  highlight: {
    type: String,
    default: ''
  },

  // 강조 문구 뒷부분
  descriptionSuffix: {
    type: String,
    default: ''
  },

  // 확인 버튼 문구
  confirmLabel: {
    type: String,
    default: ''
  },

  // 취소 버튼 문구
  cancelLabel: {
    type: String,
    default: '취소'
  }
})

const emit = defineEmits([
  'update:modelValue',
  'confirm',
  'cancel'
])

const isDanger = computed(() =>
  ['delete', 'danger'].includes(props.variant)
)

const modalImage = computed(() =>
  isDanger.value
    ? negativeAvocadoImage
    : positiveAvocadoImage
)

const confirmText = computed(() => {
  if (props.confirmLabel) {
    return props.confirmLabel
  }

  if (props.variant === 'delete') {
    return '삭제'
  }

  if (props.variant === 'complete') {
    return '완료'
  }

  return '확인'
})

const cancelText = computed(() =>
  props.cancelLabel || '취소'
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