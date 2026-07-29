<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createAccount } from '@/api/account'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()

const BANKS = [{ value: 'KB국민은행', label: 'KB국민은행' }]

const form = ref({
  bankName: 'KB국민은행',
  accountNumber: ''
})

const agreed = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const canSubmit = computed(() => form.value.accountNumber.trim() && agreed.value)

async function handleSubmit() {
  if (!canSubmit.value || loading.value) return
  loading.value = true
  errorMessage.value = ''

  try {
    await createAccount(form.value)
    router.push({ name: 'home' })
  } catch (error) {
    errorMessage.value = error?.response?.data?.message ?? '계좌 연결 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

async function pasteAccountNumber() {
  try {
    const text = await navigator.clipboard.readText()
    form.value.accountNumber = text.replace(/[^0-9-]/g, '')
  } catch {
    // 클립보드 접근 불가 시 무시
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
      <h1
        class="flex-1 text-center text-base font-semibold"
        style="color: var(--color-text-primary)"
      >
        계좌 연결하기
      </h1>
      <div class="w-9" />
    </header>

    <div class="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 pt-8 pb-12">
      <!-- 타이틀 -->
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold" style="color: var(--color-text-primary)">
          계좌를 연결해 주세요
        </h2>
        <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
          아이의 용돈 지급과 지출 관리를 위해 KB국민은행 계좌가 필요해요.
        </p>
      </div>

      <form class="flex flex-col gap-6" novalidate @submit.prevent="handleSubmit">
        <!-- 은행 선택 드롭다운 -->
        <div class="relative">
          <!-- 실제 select (투명, 클릭 영역 담당) -->
          <select v-model="form.bankName" class="bank-select">
            <option v-for="bank in BANKS" :key="bank.value" :value="bank.value">
              {{ bank.label }}
            </option>
          </select>

          <!-- 은행 카드 UI -->
          <div
            class="flex flex-col gap-3 rounded-2xl p-6"
            style="background-color: var(--color-surface); border: 1px solid var(--color-border)"
          >
            <div class="flex items-center justify-between gap-1.5">
              <span class="text-sm font-bold" style="color: var(--color-text-primary)">
                {{ form.bankName }}
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3.5 5.5L7 9l3.5-3.5"
                  stroke="var(--color-text-secondary)"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- 계좌번호 입력 -->
        <div class="flex flex-col gap-1.5">
          <label
            for="accountNumber"
            class="text-sm font-medium"
            style="color: var(--color-text-primary)"
          >
            계좌 번호 입력
          </label>
          <div
            class="flex items-center gap-2 rounded-2xl px-4 py-3"
            style="background-color: var(--color-surface); border: 1px solid var(--color-border)"
          >
            <input
              id="accountNumber"
              v-model="form.accountNumber"
              type="text"
              inputmode="numeric"
              placeholder="숫자만 입력해 주세요"
              class="flex-1 bg-transparent text-[15px] outline-none placeholder:text-sm"
              style="color: var(--color-text-primary)"
            />
            <button
              type="button"
              class="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition active:opacity-75"
              style="background-color: var(--color-avocado-300); color: var(--color-avocado-900)"
              @click="pasteAccountNumber"
            >
              붙여넣기
            </button>
          </div>
        </div>

        <!-- 오픈뱅킹 약관 동의 -->
        <label
          class="flex cursor-pointer items-center justify-between rounded-2xl px-4 py-4 transition"
          style="background-color: var(--color-surface); border: 1px solid var(--color-border)"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition"
              :style="
                agreed
                  ? 'border-color: var(--color-avocado-600); background-color: var(--color-avocado-600);'
                  : 'border-color: var(--color-border); background-color: transparent;'
              "
            >
              <svg v-if="agreed" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke="white"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span class="text-sm font-medium" style="color: var(--color-text-primary)">
              오픈뱅킹 및 서비스 약관 동의
            </span>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4l4 4-4 4"
              stroke="var(--color-text-secondary)"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <input v-model="agreed" type="checkbox" class="sr-only" />
        </label>

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
          {{ loading ? '연결 중...' : '연결하기 →' }}
        </BaseButton>
      </form>
    </div>
  </main>
</template>

<style scoped>
.bank-select {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 10;
}

input[type='text']::placeholder {
  color: var(--color-text-muted);
}
</style>
