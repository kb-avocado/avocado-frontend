<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-16">
    <div class="flex flex-col items-center gap-8">
      <img src="@/assets/images/splash.png" alt="아보카도 캐릭터" class="w-64" />

      <div class="h-24 flex items-center justify-center">
        <Transition name="fade" mode="out-in">
          <p v-if="textPhase === 'tagline'" key="tagline" class="text-center leading-snug">
            <span class="text-4xl font-bold text-avocado-600">아</span
            ><span class="text-base font-normal text-avocado-600">이와 </span>
            <span class="text-4xl font-bold text-avocado-600">보</span
            ><span class="text-base font-normal text-avocado-600">호자의 </span><br />
            <span class="text-4xl font-bold text-avocado-600">가</span
            ><span class="text-base font-normal text-avocado-600">치있는 </span>
            <span class="text-4xl font-bold text-avocado-600">도</span
            ><span class="text-base font-normal text-avocado-600">약</span>
          </p>
          <p
            v-else
            key="logo"
            class="text-4xl font-bold text-avocado-600"
            style="letter-spacing: 0.08em"
          >
            아보카도
          </p>
        </Transition>
      </div>
    </div>

    <div class="w-full flex flex-col items-center gap-2">
      <div class="w-full h-[5px] bg-avocado-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-avocado-600 rounded-full"
          :style="{
            width: progressRevealed ? '100%' : '0%',
            transition: `width ${SPLASH_DELAY_MS}ms linear`
          }"
        />
      </div>
      <p class="text-sm text-black">금융 습관을 불러오는 중...</p>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const SPLASH_DELAY_MS = 4000
const TEXT_SWITCH_MS = 1200

const textPhase = ref('tagline')
const progressRevealed = ref(false)

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(() => {
    progressRevealed.value = true
  })

  setTimeout(() => {
    textPhase.value = 'logo'
  }, TEXT_SWITCH_MS)

  setTimeout(() => {
    router.replace({ name: 'login' })
  }, SPLASH_DELAY_MS)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
