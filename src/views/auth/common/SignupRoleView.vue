<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSignupStore } from '@/stores/signup'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const signupStore = useSignupStore()

const selectedType = ref('')

function selectRole(type) {
  selectedType.value = type
}

function handleNext() {
  if (!selectedType.value) return
  signupStore.type = selectedType.value
  router.push({ name: 'signup-profile' })
}
</script>

<template>
  <main
    class="flex min-h-screen flex-col items-center justify-center px-6 py-12"
    style="background-color: var(--color-avocado-50)"
  >
    <section class="flex w-full flex-col items-center gap-8">
      <!-- 타이틀 -->
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="text-3xl font-bold leading-snug" style="color: var(--color-text-primary)">
          아보카도와 함께<br />금융 습관을 시작해요!
        </h1>
        <p style="color: var(--color-text-secondary)" class="text-sm">
          본인에게 맞는 역할을 선택해주세요.
        </p>
      </div>

      <!-- 역할 카드 -->
      <div class="flex w-full gap-4">
        <!-- 아이 카드 -->
        <button
          type="button"
          class="role-card"
          :class="{ 'role-card--active': selectedType === 'CHILD' }"
          @click="selectRole('CHILD')"
        >
          <img src="@/assets/images/child.png" alt="아이" class="h-24 w-24 object-contain" />
          <span class="text-xl font-bold" style="color: var(--color-text-primary)">아이</span>
          <span class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            용돈을 관리하고<br />저축을 배워요
          </span>
        </button>

        <!-- 보호자 카드 -->
        <button
          type="button"
          class="role-card"
          :class="{ 'role-card--active': selectedType === 'PARENT' }"
          @click="selectRole('PARENT')"
        >
          <img src="@/assets/images/parent.png" alt="보호자" class="h-24 w-24 object-contain" />
          <span class="text-xl font-bold" style="color: var(--color-text-primary)">보호자</span>
          <span class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            아이의 경제 활동을<br />함께 응원해요
          </span>
        </button>
      </div>

      <!-- 다음으로 버튼 -->
      <BaseButton class="w-full" :disabled="!selectedType" @click="handleNext">
        다음으로
      </BaseButton>
    </section>
  </main>
</template>

<style scoped>
.role-card {
  display: flex;
  flex: 1;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  border-radius: var(--radius-card);
  border: 2px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1.5rem 1rem;
  text-align: center;
  transition: all 0.15s;
}

.role-card:hover {
  border-color: var(--color-avocado-300);
  background-color: var(--color-avocado-100);
}

.role-card:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px var(--color-avocado-300);
}

.role-card--active {
  border-color: var(--color-avocado-600);
  background-color: var(--color-avocado-100);
}
</style>
