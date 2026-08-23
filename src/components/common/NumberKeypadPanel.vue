<template>
  <Transition name="keypad" @after-enter="handleAfterEnter" @after-leave="handleAfterLeave">
    <div
      v-if="modelValue"
      ref="panelRef"
      :class="
        overlay
          ? [
              'fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] bg-white px-4 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]',
              withBottomNav ? 'pb-[calc(var(--nav-height)+0.75rem)]' : 'pb-4'
            ]
          : 'w-full bg-white'
      "
    >
      <NumberKeypad :mode="mode" :disabled="disabled" @input="handleInput" @delete="handleDelete" />

      <slot />
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

import NumberKeypad from '@/components/common/NumberKeypad.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },

  mode: {
    type: String,
    default: 'amount'
  },
  /*
   * 하단 네비게이션이 있는 화면인지 여부
   *
   * false
   * → 네비게이션 높이만큼의 여백을 넣지 않는다
   */
  withBottomNav: {
    type: Boolean,
    default: true
  },

  disabled: {
    type: Boolean,
    default: false
  },

  /*
   * true
   * → 화면 아래에서 기존 내용을 덮으며 등장
   *
   * false
   * → 일반 레이아웃 안에서 등장
   */
  overlay: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'input', 'delete'])

const panelRef = ref(null)

let outsideClickTimer = null

/*
 * 키패드가 열리기 전
 * 스크롤 컨테이너의 기존 padding-bottom 저장
 */
let activeScrollContainer = null
let originalInlinePaddingBottom = ''

/*
 * 숫자 입력
 */
function handleInput(value) {
  emit('input', value)
}

/*
 * 한 자리 삭제
 */
function handleDelete() {
  emit('delete')
}

/*
 * 현재 활성화된 입력 영역
 */
function getActiveTrigger() {
  return document.querySelector('[data-keypad-trigger][data-keypad-active="true"]')
}

/*
 * 키패드 외부 클릭
 */
function handleOutsideClick(event) {
  if (!props.modelValue) {
    return
  }

  const panel = panelRef.value

  if (!panel) {
    return
  }

  /*
   * 키패드 안쪽 클릭이면 유지
   */
  if (panel.contains(event.target)) {
    return
  }

  /*
   * 숫자 입력 영역을 다시 누른 경우도 유지
   */
  const trigger = event.target.closest('[data-keypad-trigger]')

  if (trigger) {
    return
  }

  /*
   * 나머지 화면 클릭
   * → 키패드 닫기
   */
  emit('update:modelValue', false)
}

/*
 * 키패드 높이만큼
 * 스크롤 가능한 여유 공간 확보
 */
function prepareScrollSpace() {
  if (!props.overlay) {
    return
  }

  const panel = panelRef.value

  const trigger = getActiveTrigger()

  if (!panel || !trigger) {
    return
  }

  const scrollContainer = trigger.closest('[data-keypad-scroll-container]')

  if (!scrollContainer) {
    return
  }

  activeScrollContainer = scrollContainer

  /*
   * 기존 inline padding-bottom 저장
   */
  originalInlinePaddingBottom = scrollContainer.style.paddingBottom || ''

  /*
   * 현재 실제 padding-bottom
   */
  const computedStyle = window.getComputedStyle(scrollContainer)

  const currentPaddingBottom = parseFloat(computedStyle.paddingBottom) || 0

  /*
   * 실제 키패드 전체 높이
   * + 입력창과 키패드 사이 여유
   */
  const panelHeight = panel.getBoundingClientRect().height

  const extraSpace = panelHeight + 32

  /*
   * 키패드가 차지하는 만큼
   * 스크롤 영역 아래쪽 공간 확보
   */
  scrollContainer.style.paddingBottom = `${currentPaddingBottom + extraSpace}px`
}

/*
 * 입력 영역을 실제 키패드 위로 이동
 */
function ensureTriggerVisible() {
  if (!props.overlay) {
    return
  }

  const panel = panelRef.value

  const trigger = getActiveTrigger()

  if (!panel || !trigger) {
    return
  }

  const scrollContainer = trigger.closest('[data-keypad-scroll-container]')

  if (!scrollContainer) {
    return
  }

  /*
   * padding 변경이 실제 레이아웃에
   * 적용된 다음 계산
   */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const panelRect = panel.getBoundingClientRect()

      const triggerRect = trigger.getBoundingClientRect()

      /*
       * 입력창과 키패드 사이 간격
       */
      const SAFE_GAP = 20

      const overlap = triggerRect.bottom + SAFE_GAP - panelRect.top

      /*
       * 키패드가 입력창을 덮고 있다면
       * 그만큼 위로 스크롤
       */
      if (overlap > 0) {
        scrollContainer.scrollBy({
          top: overlap + 8,

          behavior: 'smooth'
        })
      }
    })
  })
}

/*
 * 키패드 완전히 열린 뒤
 */
function handleAfterEnter() {
  /*
   * 1. 먼저 스크롤 가능한 공간 확보
   */
  prepareScrollSpace()

  /*
   * 2. 그 후 입력창을 키패드 위로 이동
   */
  ensureTriggerVisible()

  /*
   * 3. 외부 클릭 이벤트 등록
   */
  outsideClickTimer = setTimeout(() => {
    document.addEventListener('click', handleOutsideClick)

    outsideClickTimer = null
  }, 0)
}

/*
 * 키패드 닫힌 뒤
 */
function handleAfterLeave() {
  document.removeEventListener('click', handleOutsideClick)

  /*
   * 우리가 추가했던
   * padding-bottom 원상복구
   */
  if (activeScrollContainer) {
    activeScrollContainer.style.paddingBottom = originalInlinePaddingBottom
  }

  activeScrollContainer = null

  originalInlinePaddingBottom = ''
}

/*
 * 상태 변경 감지
 */
watch(
  () => props.modelValue,
  (isOpen) => {
    if (outsideClickTimer) {
      clearTimeout(outsideClickTimer)

      outsideClickTimer = null
    }

    if (!isOpen) {
      document.removeEventListener('click', handleOutsideClick)
    }
  }
)

onBeforeUnmount(() => {
  if (outsideClickTimer) {
    clearTimeout(outsideClickTimer)
  }

  document.removeEventListener('click', handleOutsideClick)

  /*
   * 화면 이동 등의 이유로
   * 키패드 열린 상태에서 컴포넌트가 사라져도
   * padding 원상복구
   */
  if (activeScrollContainer) {
    activeScrollContainer.style.paddingBottom = originalInlinePaddingBottom
  }
})
</script>

<style scoped>
.keypad-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.keypad-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.keypad-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.keypad-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.keypad-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.keypad-leave-to {
  opacity: 0;
  transform: translateY(40px);
}
</style>
