<template>
  <section class="rounded-2xl bg-white p-5 shadow-sm">
    <div class="flex items-center gap-4">
      <div
        class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white"
      >
        <img :src="typeImage" alt="나의 소비 유형 캐릭터" class="h-full w-full object-contain" />
      </div>

      <div class="min-w-0">
        <p class="truncate text-lg font-bold text-gray-900">{{ name }}</p>
        <p class="text-sm text-muted">{{ userType }}</p>
        <p class="truncate text-sm text-muted">{{ email }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { DEFAULT_SPENDING_TYPE_IMAGE } from '@/constants/spendingTypeImages'

defineProps({
  name: { type: String, required: true },
  userType: { type: String, required: true }, // '보호자' | '아이'
  email: { type: String, required: true },
  // 저번달 소비 유형 캐릭터 이미지. 부모 화면 등 소비 유형이 없는 경우 기본 이미지로 대체된다.
  typeImage: { type: String, default: DEFAULT_SPENDING_TYPE_IMAGE }
})
</script>