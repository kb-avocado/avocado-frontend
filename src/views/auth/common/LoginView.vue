<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ email: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  if (loading.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const { data: response } = await login(form.value)
    authStore.setAuth({
      accessToken: response.data.tokens.accessToken,
      userInfo: response.data.user
    })
    router.push({ name: 'wallet' })
  } catch (error) {
    errorMessage.value = error?.response?.data?.message ?? '이메일 또는 비밀번호를 확인해 주세요.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-avocado-50 px-5 py-12">
    <section class="rise w-full max-w-[350px]">
      <p class="mt-6 text-[11px] font-semibold tracking-[0.22em] text-avocado-600">AVOCADO</p>
      <h1
        class="mt-2 mb-10 text-[27px] font-bold leading-[1.35] tracking-[-0.02em] text-[var(--color-avocado-900)]"
      >
        반가워요!<br />
        <span class="text-avocado-600 text-4xl">아보카도</span>에 로그인하세요
      </h1>

      <form class="flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-[13px] font-medium text-avocado-secondary">이메일</label>
          <input
            id="email"
            v-model.trim="form.email"
            type="email"
            inputmode="email"
            autocomplete="email"
            required
            placeholder="you@avocado.kr"
            class="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-[15px] text-[var(--color-avocado-900)] outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-avocado-600)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-avocado-300)]/40"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex items-baseline justify-between">
            <label for="password" class="text-[13px] font-medium text-[#3A4A3C]">비밀번호</label>
          </div>
          <div class="relative">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              placeholder="비밀번호 입력"
              class="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-3.5 pr-16 text-[15px] text-[var(--color-avocado-900)] outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-avocado-600)] focus:bg-[var(--color-surface)] focus:ring-4 focus:ring-[var(--color-avocado-300)]/40"
            />
            <button
              type="button"
              class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-avocado-100)] hover:text-[var(--color-avocado-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-avocado-600)]"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '숨기기' : '보기' }}
            </button>
          </div>
        </div>

        <p
          v-if="errorMessage"
          role="alert"
          class="rounded-xl bg-[var(--color-avocado-100)] px-3.5 py-2.5 text-[13px] text-[var(--color-avocado-600)]"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-avocado-600)] text-[15px] font-semibold text-[var(--color-surface)] transition hover:bg-[var(--color-avocado-600)]/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-avocado-300)]/60 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            v-if="loading"
            class="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-surface)]/30 border-t-[var(--color-surface)]"
          />
          {{ loading ? '로그인 중' : '로그인' }}
        </button>
      </form>

      <!-- 회원가입 -->
      <div class="mt-7 flex items-center gap-3">
        <span class="h-px flex-1 bg-[var(--color-border)]" />
        <span class="text-[12px] text-[var(--color-text-secondary)]">아직 회원이 아니신가요?</span>
        <span class="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <RouterLink
        :to="{ name: 'signup-role' }"
        class="mt-4 flex h-12 w-full items-center justify-center rounded-xl border border-[var(--color-avocado-600)]/35 text-[15px] font-semibold text-[var(--color-avocado-600)] transition hover:bg-[var(--color-avocado-100)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-avocado-300)]/60"
      >
        회원가입
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.rise {
  animation: rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .rise {
    animation: none;
  }
}
</style>
