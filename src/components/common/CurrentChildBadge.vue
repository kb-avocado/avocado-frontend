<template>
  <div class="flex items-center gap-2 mb-3">
    <span
      class="w-9 h-9 rounded-full bg-avocado-50 flex items-center justify-center overflow-hidden ring-2 ring-avocado-600 shrink-0"
    >
      <img :src="avatarImage" alt="" class="w-6 h-6 object-contain" />
    </span>

    <span class="text-sm font-semibold text-avocado-600">{{ name }}</span>
  </div>
</template>

<script setup>
defineProps({
  // 지금 보고 있는 아이 이름. 계정 전환 UI가 아니라 단순 표시용이라 클릭 이벤트는 없다.
  name: {
    type: String,
    required: true
  },
  avatarImage: {
    type: String,
    required: true
  }
})
</script>