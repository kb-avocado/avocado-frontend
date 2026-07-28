<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-between px-6 py-16">
    <div class="flex-1 flex flex-col items-center justify-center gap-8">
      <img src="@/assets/images/ch1.png" alt="아보카도 캐릭터" class="w-48" />

      <p class="text-center leading-snug">
        <span class="text-4xl font-bold text-avocado-600">아</span
        ><span class="text-base font-normal text-avocado-600">이와 </span>
        <span class="text-4xl font-bold text-avocado-600">보</span
        ><span class="text-base font-normal text-avocado-600">호자의 </span><br />
        <span class="text-4xl font-bold text-avocado-600">가</span
        ><span class="text-base font-normal text-avocado-600">치있는 </span>
        <span class="text-4xl font-bold text-avocado-600">도</span
        ><span class="text-base font-normal text-avocado-600">전</span>
      </p>
    </div>

    <div class="w-full flex flex-col items-center gap-4">
      <div class="w-full h-[5px] bg-avocado-600 rounded-full" />
      <p class="text-sm text-black">금융 습관을 불러오는 중...</p>
      <div class="flex gap-6 text-sm">
        <RouterLink to="/login" class="font-medium">로그인</RouterLink>
        <RouterLink to="/signup" class="font-medium">회원가입</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const SPLASH_DELAY_MS = 20000

onMounted(() => {
  setTimeout(() => {
    router.replace({ name: 'home' })
  }, SPLASH_DELAY_MS)
})
</script>
