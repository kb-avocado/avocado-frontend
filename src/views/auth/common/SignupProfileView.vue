<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { signup } from '@/api/auth'
import { useSignupStore } from '@/stores/signup'
import { useAuthStore } from '@/stores/auth'
import { formatPhoneNumber } from '@/utils/format'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const signupStore = useSignupStore()
const authStore = useAuthStore()

const form = ref({
  name: '',
  phone: '',
  email: '',
  birth: '',
  password: ''
})

const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const submitButtonLabel = computed(() => {
  if (signupStore.type === 'CHILD') return '가족 연결하기'
  if (signupStore.type === 'PARENT') return '계좌 등록하기'
  return '아보카도 시작하기'
})

// 서버가 010-1234-5678 형식만 받으므로 입력하는 동안 하이픈을 넣어준다.
function handlePhoneInput(event) {
  form.value.phone = formatPhoneNumber(event.target.value)
}

// 생년월일은 YYYY-MM-DD 형태로만 입력되도록 정규화한다.
function handleBirthInput(event) {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 4) {
    form.value.birth = digits
    return
  }

  if (digits.length <= 6) {
    form.value.birth = `${digits.slice(0, 4)}-${digits.slice(4)}`
    return
  }

  form.value.birth = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
}

function handleBirthChange(event) {
  const value = String(event.target.value ?? '').slice(0, 10)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    form.value.birth = ''
    return
  }

  form.value.birth = value
}

async function handleSubmit() {
  if (loading.value) return
  loading.value = true
  errorMessage.value = ''

  try {
    const { data: response } = await signup({
      type: signupStore.type,
      ...form.value,
      // 하이픈은 화면에서 보기 좋으라고 넣은 것이라, 보낼 때는 숫자만 남긴다.
      phone: form.value.phone.replace(/\D/g, '')
    })
    const user = response.data

    authStore.setUser(user)
    signupStore.reset()

    // 가입 직후에는 부모는 계좌 등록, 아이는 가족 연결을 마쳐야 한다.
    router.push({ name: user.type === 'PARENT' ? 'account-connect' : 'family-connect' })
  } catch (error) {
    errorMessage.value = error?.response?.data?.message ?? '회원가입 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen" style="background-color: var(--color-avocado-50)">
    <!-- 헤더 -->
    <header
      class="flex h-14 items-center px-4"
      style="background-color: var(--color-surface); border-bottom: 1px solid var(--color-border)"
    >
      <button
        type="button"
        class="flex items-center justify-center rounded-lg p-2 transition"
        style="color: var(--color-text-primary)"
        @click="router.back()"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12.5 16L6.5 10L12.5 4"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <h1
        class="flex-1 text-center text-base font-semibold"
        style="color: var(--color-text-primary)"
      >
        프로필 설정
      </h1>
      <div class="w-9" />
    </header>

    <div class="mx-auto flex w-full max-w-md flex-col gap-8 px-6 pb-12 pt-6">
      <!-- 프로필 사진 (후순위 — 더미 영역) -->
      <div class="flex flex-col items-center gap-2">
        <div
          class="relative h-24 w-24 rounded-full flex items-center justify-center"
          style="background-color: var(--color-avocado-100); border: 2px solid var(--color-border)"
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="16" r="7" fill="var(--color-avocado-300)" />
            <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" fill="var(--color-avocado-300)" />
          </svg>
          <div
            class="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full shadow"
            style="background-color: var(--color-avocado-600)"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9.5 2.5L11.5 4.5M2 12l1.5-4L10 1.5l2.5 2.5-6.5 6.5L2 12z"
                stroke="white"
                stroke-width="1.3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
        <span class="text-xs" style="color: var(--color-text-secondary)">프로필 사진 등록</span>
      </div>

      <!-- 폼 -->
      <form class="flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
        <!-- 이름 -->
        <div class="flex flex-col gap-1.5">
          <label for="name" class="text-sm font-medium" style="color: var(--color-text-primary)">
            이름
          </label>
          <input
            id="name"
            v-model.trim="form.name"
            type="text"
            placeholder="이름을 입력해주세요"
            class="input-field"
          />
        </div>

        <!-- 휴대폰 번호 -->
        <div class="flex flex-col gap-1.5">
          <label for="phone" class="text-sm font-medium" style="color: var(--color-text-primary)">
            휴대폰 번호
          </label>
          <div class="relative">
            <input
              id="phone"
              :value="form.phone"
              type="tel"
              inputmode="numeric"
              maxlength="13"
              placeholder="010-1234-5678"
              class="input-field pr-10"
              @input="handlePhoneInput"
            />
            <svg
              class="absolute right-3.5 top-1/2 -translate-y-1/2"
              style="color: var(--color-text-muted)"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M3 3h3.5l1.5 4-2 1.5A11 11 0 0010.5 12L12 10l4 1.5V15A2 2 0 0114 17C7.373 17 1 10.627 1 4a2 2 0 012-1z"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>

        <!-- 이메일 -->
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-sm font-medium" style="color: var(--color-text-primary)">
            이메일
          </label>
          <div class="relative">
            <input
              id="email"
              v-model.trim="form.email"
              type="email"
              inputmode="email"
              autocomplete="email"
              placeholder="abc1234@naver.com"
              class="input-field pr-10"
            />
            <svg
              class="absolute right-3.5 top-1/2 -translate-y-1/2"
              style="color: var(--color-text-muted)"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <rect
                x="1"
                y="3"
                width="16"
                height="12"
                rx="2"
                stroke="currentColor"
                stroke-width="1.3"
              />
              <path
                d="M1 6l8 5 8-5"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>

        <!-- 생년월일 -->
        <div class="flex flex-col gap-1.5">
          <label for="birth" class="text-sm font-medium" style="color: var(--color-text-primary)">
            생년월일
          </label>
          <div class="relative">
            <input
              id="birth"
              v-model="form.birth"
              type="date"
              min="1900-01-01"
              max="2999-12-31"
              class="input-field pr-10"
              style="color: var(--color-text-muted)"
              @change="handleBirthChange"
            />
          </div>
        </div>

        <!-- 비밀번호 -->
        <div class="flex flex-col gap-1.5">
          <label
            for="password"
            class="text-sm font-medium"
            style="color: var(--color-text-primary)"
          >
            비밀번호
          </label>
          <div class="relative">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="비밀번호를 입력해주세요"
              class="input-field pr-16"
            />
            <button
              type="button"
              class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition"
              style="color: var(--color-text-secondary)"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '숨기기' : '보기' }}
            </button>
          </div>
        </div>

        <!-- 에러 메시지 -->
        <p
          v-if="errorMessage"
          role="alert"
          class="rounded-xl px-3.5 py-2.5 text-sm text-red-700"
          style="background-color: #fef2f2"
        >
          {{ errorMessage }}
        </p>

        <!-- 제출 버튼 -->
        <BaseButton type="submit" class="w-full" :disabled="loading">
          <span
            v-if="loading"
            class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          />
          {{ loading ? '가입 중...' : submitButtonLabel }}
        </BaseButton>
      </form>
    </div>
  </main>
</template>

<style scoped>
.input-field {
  width: 100%;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 0.75rem 0.875rem;
  font-size: 15px;
  color: var(--color-text-primary);
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.input-field::placeholder {
  color: var(--color-text-muted);
}

.input-field:focus {
  border-color: var(--color-avocado-600);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-avocado-300) 50%, transparent);
}
</style>
