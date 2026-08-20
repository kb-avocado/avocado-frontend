<template>
  <div class="min-h-full flex flex-col items-center justify-center gap-2 px-6 py-16">
    <img :src="cadoseedImage" alt="아보카도 씨" class="w-28 h-28 object-contain opacity-60" />

    <p class="text-sm text-gray-500">생성된 리포트가 없습니다.</p>

    <p class="text-xs text-gray-400">리포트는 매달 1일에 지난달 기준으로 만들어져요.</p>
  </div>
</template>

<script setup>
import cadoseedImage from '@/assets/images/cadoseed.png'
</script>
