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

// 필드별 안내 문구. 값이 비어 있으면 그 필드는 통과한 상태다.
const fieldErrors = ref({ email: '', password: '' })

const validators = {
  email(value) {
    if (!value) return '이메일을 입력해주세요.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return '이메일 형식이 올바르지 않습니다.'
    return ''
  },
  password(value) {
    if (!value) return '비밀번호를 입력해주세요.'
    return ''
  }
}

function validateField(field) {
  fieldErrors.value[field] = validators[field](form.value[field])
}

function clearFieldErrorIfFixed(field) {
  if (!fieldErrors.value[field]) return
  if (!validators[field](form.value[field])) fieldErrors.value[field] = ''
}

async function handleSubmit() {
  if (loading.value) return

  Object.keys(validators).forEach(validateField)
  if (Object.values(fieldErrors.value).some(Boolean)) {
    errorMessage.value = ''
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const { data: response } = await login(form.value)
    const user = response.data

    authStore.setUser(user)

    router.push({ name: 'home' })
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
      <h1
        class="mt-6 mb-7 text-[22px] font-bold leading-[1.35] tracking-[-0.02em] text-[var(--color-avocado-900)]"
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
            class="w-full rounded-xl border bg-[var(--color-surface)] px-3.5 py-2.5 text-[15px] text-[var(--color-avocado-900)] outline-none transition placeholder:text-[var(--color-text-secondary)] focus:bg-[var(--color-surface)] focus:ring-4"
            :class="
              fieldErrors.email
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : 'border-[var(--color-border)] focus:border-[var(--color-avocado-600)] focus:ring-[var(--color-avocado-300)]/40'
            "
            :aria-invalid="Boolean(fieldErrors.email)"
            aria-describedby="email-error"
            @blur="validateField('email')"
            @input="clearFieldErrorIfFixed('email')"
          />
          <p v-if="fieldErrors.email" id="email-error" class="field-error">
            {{ fieldErrors.email }}
          </p>
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
              class="w-full rounded-xl border bg-[var(--color-surface)] py-2.5 pl-3.5 pr-16 text-[15px] text-[var(--color-avocado-900)] outline-none transition placeholder:text-[var(--color-text-secondary)] focus:bg-[var(--color-surface)] focus:ring-4"
              :class="
                fieldErrors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                  : 'border-[var(--color-border)] focus:border-[var(--color-avocado-600)] focus:ring-[var(--color-avocado-300)]/40'
              "
              :aria-invalid="Boolean(fieldErrors.password)"
              aria-describedby="password-error"
              @blur="validateField('password')"
              @input="clearFieldErrorIfFixed('password')"
            />
            <button
              type="button"
              class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-avocado-100)] hover:text-[var(--color-avocado-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-avocado-600)]"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '숨기기' : '보기' }}
            </button>
          </div>
          <p v-if="fieldErrors.password" id="password-error" class="field-error">
            {{ fieldErrors.password }}
          </p>
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
.field-error {
  font-size: 12px;
  line-height: 1.4;
  color: #dc2626;
}

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
