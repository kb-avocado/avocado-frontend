<template>
  <header
    class="relative flex items-center justify-between h-16 px-4 bg-white border-b border-gray-100"
  >
    <div class="flex items-center w-8">
      <button
        type="button"
        class="p-1 -ml-1 text-avocado-600"
        aria-label="뒤로 가기"
        @click="$emit('click-back')"
      >
        <ChevronLeft :size="22" />
      </button>
    </div>

    <!-- 양옆 요소의 너비와 무관하게 화면 정중앙에 오도록 절대 위치로 놓는다.
         제목이 없는 화면도 있어서 비어 있으면 아예 그리지 않는다. -->
    <h1
      v-if="title"
      class="absolute left-1/2 -translate-x-1/2 text-[17px] font-medium text-gray-900 truncate max-w-[62%] text-center"
    >
      {{ title }}
    </h1>

    <!-- 로그인 전 화면이라 알림과 프로필은 두지 않는다. 오른쪽은 균형을 맞추는 빈 칸이다. -->
    <div class="w-8 shrink-0" />
  </header>
</template>

<script setup>
import { ChevronLeft } from 'lucide-vue-next'

defineProps({
  title: { type: String, default: '' }
})

defineEmits(['click-back'])
</script>
