<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

import { checkEmail, signup } from '@/api/auth'

import { useSignupStore } from '@/stores/signup'
import { useAuthStore } from '@/stores/auth'

import { formatPhoneNumber } from '@/utils/format'
import { isValidPassword } from '@/utils/validators'

import BaseButton from '@/components/common/BaseButton.vue'
import SignupHeader from '@/components/common/SignupHeader.vue'

const router = useRouter()

const signupStore = useSignupStore()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  birth: '',
  phone: ''
})

// toISOString()은 UTC 기준이라 새벽에 하루 밀린다.
// 로컬 날짜로 직접 만든다.
const now = new Date()

const todayISO = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0')
].join('-')

// 필드별 안내 문구
const fieldErrors = ref({
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  birth: '',
  phone: ''
})

// 각 필드의 검사 규칙
const validators = {
  email(value) {
    if (!value) return '이메일을 입력해주세요.'

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return '이메일 형식이 올바르지 않습니다.'
    }

    return ''
  },

  password(value) {
    if (!value) return '비밀번호를 입력해주세요.'

    if (!isValidPassword(value)) {
      return '영문과 숫자를 포함해 8자 이상으로 입력해주세요.'
    }

    return ''
  },

  passwordConfirm(value) {
    if (!value) {
      return '비밀번호를 한 번 더 입력해주세요.'
    }

    if (value !== form.value.password) {
      return '비밀번호가 일치하지 않습니다.'
    }

    return ''
  },

  name(value) {
    if (!value) return '이름을 입력해주세요.'

    if (!/^[가-힣a-zA-Z\s]{2,20}$/.test(value)) {
      return '이름은 한글 또는 영문 2~20자로 입력해주세요.'
    }

    return ''
  },

  birth(value) {
    if (!value) return '생년월일을 선택해주세요.'

    if (value > todayISO) {
      return '생년월일은 이전 날짜만 선택할 수 있습니다.'
    }

    return ''
  },

  phone(value) {
    if (!value) return '휴대폰 번호를 입력해주세요.'

    if (!value.startsWith('010')) {
      return '휴대폰 번호는 010으로 시작해야 합니다.'
    }

    if (!/^010-\d{4}-\d{4}$/.test(value)) {
      return '휴대폰 번호 11자리를 모두 입력해주세요.'
    }

    return ''
  }
}

const DUPLICATE_EMAIL_CODE = 'USR-006'
const DUPLICATE_PHONE_CODE = 'USR-007'

const DUPLICATE_EMAIL_MESSAGE = '이미 가입된 이메일입니다.'
const DUPLICATE_PHONE_MESSAGE = '이미 가입된 전화번호입니다.'

function normalizeEmail(value) {
  return value.trim().toLowerCase()
}

const showPassword = ref(false)
const showPasswordConfirm = ref(false)

const loading = ref(false)
const errorMessage = ref('')

const emailCheckStatus = ref('')

let latestEmailCheckId = 0

const submitButtonLabel = computed(() => {
  if (signupStore.type === 'CHILD') {
    return '회원가입'
  }

  if (signupStore.type === 'PARENT') {
    return '계좌 등록하기'
  }

  return '아보카도 시작하기'
})

// 입력이 끝난 시점에 필드 검사
function validateField(field) {
  fieldErrors.value[field] = validators[field](form.value[field])

  // 비밀번호를 변경하면 비밀번호 확인도 다시 검사
  if (field === 'password' && fieldErrors.value.passwordConfirm) {
    fieldErrors.value.passwordConfirm = validators.passwordConfirm(form.value.passwordConfirm)
  }
}

// 이미 에러가 표시된 필드를 수정하면 즉시 다시 검사
function clearFieldErrorIfFixed(field) {
  if (!fieldErrors.value[field]) return

  if (!validators[field](form.value[field])) {
    fieldErrors.value[field] = ''
  }
}

// 이메일 중복 확인
async function handleEmailCheck() {
  if (emailCheckStatus.value === 'checking') {
    return
  }

  validateField('email')

  if (fieldErrors.value.email) {
    return
  }

  const email = normalizeEmail(form.value.email)

  const requestId = (latestEmailCheckId += 1)

  emailCheckStatus.value = 'checking'

  try {
    const { data: response } = await checkEmail(email)

    if (requestId !== latestEmailCheckId) {
      return
    }

    if (response.data.email !== normalizeEmail(form.value.email)) {
      return
    }

    if (response.data.available) {
      emailCheckStatus.value = 'available'
      return
    }

    emailCheckStatus.value = ''

    fieldErrors.value.email = DUPLICATE_EMAIL_MESSAGE
  } catch {
    if (requestId === latestEmailCheckId) {
      emailCheckStatus.value = 'failed'
    }
  }
}

// 이메일 수정 시 중복 확인 상태 초기화
function handleEmailInput() {
  latestEmailCheckId += 1

  emailCheckStatus.value = ''

  if (fieldErrors.value.email === DUPLICATE_EMAIL_MESSAGE) {
    fieldErrors.value.email = ''
  }

  clearFieldErrorIfFixed('email')
}

// 하이픈 제외 숫자 기준으로 커서 위치 계산
function caretAfterDigits(text, digitCount) {
  if (digitCount === 0) return 0

  let seen = 0

  for (let i = 0; i < text.length; i += 1) {
    if (/\d/.test(text[i])) {
      seen += 1

      if (seen === digitCount) {
        return i + 1
      }
    }
  }

  return text.length
}

// 휴대폰 번호 입력
async function handlePhoneInput(event) {
  const input = event.target
  const raw = input.value

  const caret = input.selectionStart ?? raw.length

  const digitsBeforeCaret = raw.slice(0, caret).replace(/\D/g, '').length

  const formatted = formatPhoneNumber(raw)

  form.value.phone = formatted

  if (fieldErrors.value.phone === DUPLICATE_PHONE_MESSAGE) {
    fieldErrors.value.phone = ''
  }

  clearFieldErrorIfFixed('phone')

  await nextTick()

  if (input.value !== formatted) {
    input.value = formatted
  }

  const nextCaret = caretAfterDigits(formatted, digitsBeforeCaret)

  input.setSelectionRange(nextCaret, nextCaret)
}

// 생년월일 입력
function handleBirthChange(event) {
  const value = String(event.target.value ?? '').slice(0, 10)

  form.value.birth = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''

  validateField('birth')
}

// 회원가입
async function handleSubmit() {
  if (loading.value) return

  // 모든 필드 검사
  Object.keys(validators).forEach(validateField)

  // 이메일 중복 확인 여부 검사
  if (!fieldErrors.value.email && emailCheckStatus.value !== 'available') {
    fieldErrors.value.email = '이메일 중복 확인을 해주세요.'
  }

  if (Object.values(fieldErrors.value).some(Boolean)) {
    errorMessage.value = '입력하신 내용을 다시 확인해주세요.'

    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const { email, password, name, birth, phone } = form.value

    const { data: response } = await signup({
      type: signupStore.type,
      email: normalizeEmail(email),
      password,
      name,
      birth,
      phone: phone.replace(/\D/g, '')
    })

    const user = response.data

    authStore.setUser(user)

    signupStore.reset()

    // 가입 후 계정 상태에 따라
    // 라우터 가드가 다음 화면 결정
    router.push({
      name: 'home'
    })
  } catch (error) {
    const code = error?.response?.data?.code

    const message = error?.response?.data?.message

    if (code === DUPLICATE_EMAIL_CODE) {
      emailCheckStatus.value = ''

      fieldErrors.value.email = message ?? DUPLICATE_EMAIL_MESSAGE

      errorMessage.value = '입력하신 내용을 다시 확인해주세요.'
    } else if (code === DUPLICATE_PHONE_CODE) {
      fieldErrors.value.phone = message ?? DUPLICATE_PHONE_MESSAGE

      errorMessage.value = '입력하신 내용을 다시 확인해주세요.'
    } else {
      errorMessage.value = message ?? '회원가입 중 오류가 발생했습니다.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen" style="background-color: var(--color-avocado-50)">
    <SignupHeader title="회원가입" @click-back="router.back()" />

    <!-- 약관 화면과 동일한 전체 레이아웃 -->
    <section class="mx-auto flex w-full max-w-md flex-col gap-8 px-6 pb-12 pt-10">
      <!-- 타이틀 -->
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold leading-snug" style="color: var(--color-text-primary)">
          회원 정보를 입력해주세요
        </h2>

        <p class="text-sm" style="color: var(--color-text-secondary)">
          아보카도 이용을 위해 기본 정보를 입력해주세요.
        </p>
      </div>

      <!-- 회원가입 폼 -->
      <form class="flex flex-col gap-5" novalidate @submit.prevent="handleSubmit">
        <!-- 이메일 -->
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-sm font-medium" style="color: var(--color-text-primary)">
            이메일
          </label>

          <div class="flex items-start gap-2">
            <div class="relative flex-1">
              <input
                id="email"
                v-model.trim="form.email"
                type="email"
                inputmode="email"
                autocomplete="email"
                placeholder="abc1234@naver.com"
                class="input-field pr-10"
                :class="{
                  'input-field--error': fieldErrors.email
                }"
                :aria-invalid="Boolean(fieldErrors.email)"
                aria-describedby="email-error"
                @blur="validateField('email')"
                @input="handleEmailInput"
              />

              <!-- 이메일 아이콘 -->
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

            <button
              type="button"
              class="email-check-button"
              :disabled="!form.email || emailCheckStatus === 'checking'"
              @click="handleEmailCheck"
            >
              {{ emailCheckStatus === 'checking' ? '확인 중' : '중복 확인' }}
            </button>
          </div>

          <p v-if="fieldErrors.email" id="email-error" class="field-error">
            {{ fieldErrors.email }}
          </p>

          <p v-else-if="emailCheckStatus === 'available'" class="field-hint field-hint--ok">
            사용 가능한 이메일입니다.
          </p>

          <p v-else-if="emailCheckStatus === 'failed'" class="field-error">
            중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.
          </p>
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
              :class="{
                'input-field--error': fieldErrors.password
              }"
              :aria-invalid="Boolean(fieldErrors.password)"
              aria-describedby="password-error"
              @blur="validateField('password')"
              @input="clearFieldErrorIfFixed('password')"
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

          <p v-if="fieldErrors.password" id="password-error" class="field-error">
            {{ fieldErrors.password }}
          </p>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="flex flex-col gap-1.5">
          <label
            for="passwordConfirm"
            class="text-sm font-medium"
            style="color: var(--color-text-primary)"
          >
            비밀번호 확인
          </label>

          <div class="relative">
            <input
              id="passwordConfirm"
              v-model="form.passwordConfirm"
              :type="showPasswordConfirm ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="비밀번호를 다시 입력해주세요"
              class="input-field pr-16"
              :class="{
                'input-field--error': fieldErrors.passwordConfirm
              }"
              :aria-invalid="Boolean(fieldErrors.passwordConfirm)"
              aria-describedby="passwordConfirm-error"
              @blur="validateField('passwordConfirm')"
              @input="clearFieldErrorIfFixed('passwordConfirm')"
            />

            <button
              type="button"
              class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition"
              style="color: var(--color-text-secondary)"
              @click="showPasswordConfirm = !showPasswordConfirm"
            >
              {{ showPasswordConfirm ? '숨기기' : '보기' }}
            </button>
          </div>

          <p v-if="fieldErrors.passwordConfirm" id="passwordConfirm-error" class="field-error">
            {{ fieldErrors.passwordConfirm }}
          </p>
        </div>

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
            :class="{
              'input-field--error': fieldErrors.name
            }"
            :aria-invalid="Boolean(fieldErrors.name)"
            aria-describedby="name-error"
            @blur="validateField('name')"
            @input="clearFieldErrorIfFixed('name')"
          />

          <p v-if="fieldErrors.name" id="name-error" class="field-error">
            {{ fieldErrors.name }}
          </p>
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
              :max="todayISO"
              class="input-field pr-10"
              :class="{
                'input-field--error': fieldErrors.birth
              }"
              :style="{
                color: form.birth ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
              }"
              :aria-invalid="Boolean(fieldErrors.birth)"
              aria-describedby="birth-error"
              @change="handleBirthChange"
              @blur="validateField('birth')"
            />
          </div>

          <p v-if="fieldErrors.birth" id="birth-error" class="field-error">
            {{ fieldErrors.birth }}
          </p>
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
              placeholder="010-1234-5678"
              class="input-field pr-10"
              :class="{
                'input-field--error': fieldErrors.phone
              }"
              :aria-invalid="Boolean(fieldErrors.phone)"
              aria-describedby="phone-error"
              @input="handlePhoneInput"
              @blur="validateField('phone')"
            />

            <!-- 전화 아이콘 -->
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

          <p v-if="fieldErrors.phone" id="phone-error" class="field-error">
            {{ fieldErrors.phone }}
          </p>
        </div>

        <!-- 전체 에러 메시지 -->
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
    </section>
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

.input-field--error {
  border-color: #dc2626;
}

.input-field--error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 4px color-mix(in srgb, #dc2626 20%, transparent);
}

.field-error {
  font-size: 12px;
  line-height: 1.4;
  color: #dc2626;
}

.field-hint {
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}

.field-hint--ok {
  color: var(--color-avocado-600);
}

/* 이메일 중복 확인 버튼 */
.email-check-button {
  flex-shrink: 0;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-avocado-600);
  background-color: var(--color-avocado-600);
  padding: 0.75rem 0.875rem;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-surface);
  transition:
    background-color 0.15s,
    opacity 0.15s;
}

.email-check-button:hover:not(:disabled) {
  opacity: 0.9;
}

.email-check-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-avocado-300) 50%, transparent);
}

.email-check-button:disabled {
  cursor: not-allowed;
  border-color: var(--color-avocado-300);
  background-color: var(--color-avocado-300);
  color: var(--color-surface);
}
</style>
