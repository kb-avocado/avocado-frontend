<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { createAccount } from '@/api/account'
import BaseButton from '@/components/common/BaseButton.vue'
import SignupHeader from '@/components/common/SignupHeader.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const BANKS = [{ code: '004', name: 'KB국민은행', accountLength: 14 }]

const form = ref({
  bankCode: BANKS[0].code,
  accountNumber: ''
})

const agreed = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const selectedBank = computed(
  () => BANKS.find((bank) => bank.code === form.value.bankCode) ?? BANKS[0]
)

const selectedBankName = computed(() => selectedBank.value.name)
const accountNumberLength = computed(() => selectedBank.value.accountLength)

// 자릿수가 모자라도, 넘쳐도 계좌가 아니다. 입력한 만큼을 화면에 함께 보여줘
// 몇 자리가 남았는지 사용자가 세지 않아도 되게 한다.
const isAccountNumberComplete = computed(
  () => form.value.accountNumber.length === accountNumberLength.value
)

const canSubmit = computed(() => {
  const { accountNumber } = form.value
  return /^[0-9]+$/.test(accountNumber) && isAccountNumberComplete.value && agreed.value
})

function sanitizeAccountNumber(value) {
  return value.replace(/\D/g, '').slice(0, accountNumberLength.value)
}

function handleAccountNumberInput(event) {
  form.value.accountNumber = sanitizeAccountNumber(event.target.value)
}

// 자릿수가 더 짧은 은행으로 바꾸면 이미 입력해 둔 번호가 새 한도를 넘는다.
watch(accountNumberLength, () => {
  form.value.accountNumber = sanitizeAccountNumber(form.value.accountNumber)
})

async function handleSubmit() {
  if (!canSubmit.value || loading.value) return
  loading.value = true
  errorMessage.value = ''

  try {
    await createAccount({
      bankCode: form.value.bankCode,
      accountNumber: form.value.accountNumber
    })

    // 계좌가 등록되면 서버가 계정을 PENDING에서 ACTIVE로 바꾼다.
    // 메모리의 로그인 정보는 아직 PENDING이라 최신 정보로 맞춘다.
    try {
      await authStore.refresh()
    } catch {
      // 계좌 등록은 서버에서 이미 끝나 사용자가 다시 시도할 일이 없다.
      // 갱신에 실패해도 화면을 막지 않는다. 이어지는 홈 이동에서 가드가 다시 물어본다.
    }

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
    form.value.accountNumber = sanitizeAccountNumber(text)
  } catch {
    // 클립보드 접근 불가 시 무시
  }
}
</script>

<template>
  <main class="flex min-h-screen flex-col" style="background-color: var(--color-avocado-50)">
    <!-- 헤더 -->
    <SignupHeader title="계좌 연결하기" @click-back="router.back()" />

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
          <select v-model="form.bankCode" class="bank-select">
            <option v-for="bank in BANKS" :key="bank.code" :value="bank.code">
              {{ bank.name }}
            </option>
          </select>

          <!-- 은행 카드 UI -->
          <div
            class="flex flex-col gap-3 rounded-2xl p-6"
            style="background-color: var(--color-surface); border: 1px solid var(--color-border)"
          >
            <div class="flex items-center justify-between gap-1.5">
              <span class="text-sm font-bold" style="color: var(--color-text-primary)">
                {{ selectedBankName }}
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
          <div class="flex items-center justify-between">
            <label
              for="accountNumber"
              class="text-sm font-medium"
              style="color: var(--color-text-primary)"
            >
              계좌 번호 입력
            </label>
            <span
              class="text-xs font-medium"
              :style="
                isAccountNumberComplete
                  ? 'color: var(--color-avocado-600);'
                  : 'color: var(--color-text-muted);'
              "
            >
              {{ form.accountNumber.length }}/{{ accountNumberLength }}
            </span>
          </div>
          <div
            class="flex items-center gap-2 rounded-2xl px-4 py-3"
            style="background-color: var(--color-surface); border: 1px solid var(--color-border)"
          >
            <input
              id="accountNumber"
              v-model="form.accountNumber"
              type="text"
              inputmode="numeric"
              :maxlength="accountNumberLength"
              :placeholder="`숫자 ${accountNumberLength}자리를 입력해 주세요`"
              class="flex-1 bg-transparent text-[15px] outline-none placeholder:text-sm"
              style="color: var(--color-text-primary)"
              @input="handleAccountNumberInput"
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
