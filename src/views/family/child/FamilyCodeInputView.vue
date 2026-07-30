<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { requestFamilyConnect } from '@/api/family'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()

const CODE_LENGTH = 6
const codeInputs = ref(Array(CODE_LENGTH).fill(''))
const inputRefs = ref([])
const loading = ref(false)
const errorMessage = ref('')

const fullCode = computed(() => codeInputs.value.join(''))
const canSubmit = computed(() => fullCode.value.length === CODE_LENGTH)

function onInput(index, event) {
  const val = event.target.value
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-1)
    .toUpperCase()
  codeInputs.value[index] = val

  if (val && index < CODE_LENGTH - 1) {
    inputRefs.value[index + 1]?.focus()
  }
}

function onBeforeInput(index, event) {
  if (event.inputType !== 'insertText') return

  const nextChar = (event.data ?? '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-1)
    .toUpperCase()
  if (!nextChar) {
    event.preventDefault()
    return
  }

  event.preventDefault()
  codeInputs.value[index] = nextChar

  if (index < CODE_LENGTH - 1) {
    inputRefs.value[index + 1]?.focus()
  }
}

function onKeydown(index, event) {
  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    inputRefs.value[index - 1]?.focus()
    return
  }

  if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
    event.preventDefault()
    inputRefs.value[index + 1]?.focus()
    return
  }

  if (event.key === 'Backspace' && !codeInputs.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

function onPaste(event) {
  event.preventDefault()
  const pasted = event.clipboardData
    .getData('text')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
  pasted
    .split('')
    .slice(0, CODE_LENGTH)
    .forEach((char, i) => {
      codeInputs.value[i] = char
    })
  const nextEmpty = codeInputs.value.findIndex((v) => !v)
  const focusIndex = nextEmpty === -1 ? CODE_LENGTH - 1 : nextEmpty
  inputRefs.value[focusIndex]?.focus()
}

async function handleSubmit() {
  if (!canSubmit.value || loading.value) return
  loading.value = true
  errorMessage.value = ''

  try {
    const { data } = await requestFamilyConnect({ code: fullCode.value })
    router.push({ name: 'family-pending', params: { requestId: data.requestId } })
  } catch (error) {
    errorMessage.value = error?.response?.data?.message ?? '연결 요청 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen flex-col" style="background-color: var(--color-avocado-50)">
    <!-- 헤더 -->
    <header
      class="flex h-14 items-center px-4"
      style="background-color: var(--color-surface); border-bottom: 1px solid var(--color-border)"
    >
      <button
        type="button"
        class="flex items-center justify-center rounded-lg p-2"
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
      <div class="w-9" />
    </header>

    <div class="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 pt-8 pb-12">
      <!-- 타이틀 -->
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-bold" style="color: var(--color-text-primary)">
          가족 연결 코드 입력
        </h1>
        <p class="text-sm" style="color: var(--color-text-secondary)">
          보호자님께 받은 6자리 코드를 입력해주세요.
        </p>
      </div>

      <form class="flex flex-col gap-6" novalidate @submit.prevent="handleSubmit">
        <!-- 6칸 코드 입력 -->
        <div class="flex gap-2" @paste="onPaste">
          <input
            v-for="(_, index) in codeInputs"
            :key="index"
            :ref="(el) => (inputRefs[index] = el)"
            :value="codeInputs[index]"
            type="text"
            inputmode="text"
            maxlength="1"
            class="code-input"
            :class="{ 'code-input--filled': codeInputs[index] }"
            @beforeinput="onBeforeInput(index, $event)"
            @input="onInput(index, $event)"
            @keydown="onKeydown(index, $event)"
          />
        </div>

        <!-- 안내 문구 -->
        <p class="text-xs leading-relaxed" style="color: var(--color-text-secondary)">
          코드는 대소문자 구분 없이 입력 가능하며, 보호자님 앱의 '마이페이지' 메뉴에서 확인하실 수
          있습니다.
        </p>

        <!-- 에러 메시지 -->
        <p
          v-if="errorMessage"
          role="alert"
          class="rounded-xl px-3.5 py-2.5 text-sm text-red-700"
          style="background-color: #fef2f2"
        >
          {{ errorMessage }}
        </p>

        <!-- 연결하기 버튼 -->
        <BaseButton type="submit" class="w-full" :disabled="!canSubmit || loading">
          <span
            v-if="loading"
            class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          />
          {{ loading ? '연결 중...' : '연결하기' }}
        </BaseButton>
      </form>
    </div>
  </main>
</template>

<style scoped>
.code-input {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  border: 1.5px solid var(--color-border);
  background-color: var(--color-surface);
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  caret-color: transparent;
}

.code-input:focus {
  border-color: var(--color-avocado-600);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-avocado-300) 50%, transparent);
}

.code-input--filled {
  border-color: var(--color-avocado-600);
  background-color: var(--color-avocado-100);
}
</style>
