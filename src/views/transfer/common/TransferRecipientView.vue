<template>
  <NoChildConnected
    v-if="isParentWithNoChild"
  />

  <main
    v-else
    class="flex min-h-full flex-col bg-white px-4 pb-5 pt-6"
  >
    <div>
      <h1 class="text-xl font-bold text-gray-900">
        누구에게 돈을 보낼까요?
      </h1>

      <p class="mt-2 text-sm text-gray-500">
        은행과 계좌번호를 입력해주세요.
      </p>
    </div>

    <form
      data-keypad-scroll-container
      class="mt-8 flex flex-1 flex-col"
      novalidate
      @submit.prevent="handleNext"
    >
      <div class="space-y-6">
        <!-- 은행 선택 -->
        <BankSelect
          v-model="form.bankCode"
          :banks="banks"
          :error="errors.bankCode"
          @update:model-value="handleBankChange"
          @blur="validateBank"
        />

        <!-- 계좌번호 -->
        <div>
          <label
            class="mb-2 block text-sm font-medium text-gray-700"
          >
            계좌번호
          </label>

          <button
            type="button"
            data-keypad-trigger
            :data-keypad-active="
              showAccountKeypad
                ? 'true'
                : 'false'
            "
            class="flex w-full items-center rounded-xl border bg-white p-3 text-left transition-colors"
            :class="
              showAccountKeypad
                ? 'border-avocado-500 ring-1 ring-avocado-500'
                : errors.accountNumber
                  ? 'border-red-400'
                  : 'border-gray-200'
            "
            @click="openAccountKeypad"
          >
            <span
              class="flex-1 text-sm"
              :class="
                form.accountNumber
                  ? 'text-gray-900'
                  : 'text-gray-400'
              "
            >
              {{
                form.accountNumber
                  || '계좌번호를 입력해주세요'
              }}
            </span>
          </button>

          <p
            v-if="errors.accountNumber"
            role="alert"
            class="mt-1 text-xs text-red-500"
          >
            {{ errors.accountNumber }}
          </p>
        </div>

        <!-- 최근 보낸 사람 -->
        <RecentRecipientList
          :recipients="recentRecipients"
          :loading="isRecentLoading"
          :error="recentError"
          @retry="fetchRecentRecipients"
          @select="selectRecentRecipient"
        />
      </div>

      <!-- 키패드가 닫힌 상태의 다음 버튼 -->
      <div
        v-if="!showAccountKeypad"
        class="mt-auto pt-5 px-4"
      >
        <BaseButton
          variant="primary"
          class="w-full"
          :disabled="!canGoNext"
          @click="handleNext"
        >
          다음
        </BaseButton>
      </div>
    </form>

    <!-- 계좌번호 키패드 -->
    <NumberKeypadPanel
      v-model="showAccountKeypad"
      overlay
      mode="amount"
      @input="appendAccountDigit"
      @delete="deleteAccountDigit"
    >
      <!-- 키패드 바로 아래 다음 -->
      <div class="mt-3 px-4">
        <BaseButton
          variant="primary"
          class="w-full"
          :disabled="!canGoNext"
          @click="handleNext"
        >
          다음
        </BaseButton>
      </div>
    </NumberKeypadPanel>
  </main>
</template>

<script setup>
import {
  computed,
  ref
} from 'vue'

import {
  useRouter
} from 'vue-router'

import BaseButton from '@/components/common/BaseButton.vue'
import NoChildConnected from '@/components/common/NoChildConnected.vue'
import NumberKeypadPanel from '@/components/common/NumberKeypadPanel.vue'

import BankSelect from '@/components/transfer/BankSelect.vue'
import RecentRecipientList from '@/components/transfer/RecentRecipientList.vue'

import {
  useRecentTransferRecipients
} from '@/composables/transfer/useRecentTransferRecipients'

import {
  useTransferRecipientSearch
} from '@/composables/transfer/useTransferRecipientSearch'

import {
  useTransferStore
} from '@/stores/transfer'

import {
  useAuthStore
} from '@/stores/auth'

const router =
  useRouter()

const transferStore =
  useTransferStore()

const authStore =
  useAuthStore()

const showAccountKeypad =
  ref(false)

/**
 * 부모인데 연결된 아이가 없는 경우
 */
const isParentWithNoChild =
  computed(
    () =>
      authStore.user?.type ===
        'PARENT' &&
      (
        authStore.user?.child ??
        []
      ).length === 0
  )

/**
 * 최근 송금 대상 선택
 */
async function selectRecentRecipient(
  recipient
) {
  transferStore.setRecipient(
    recipient
  )

  await router.push({
    name:
      'transfer-amount'
  })
}

const {
  banks,
  form,
  errors,
  clearFieldError,
  validateAccountNumber,
  validateBank,
  searchRecipient
} = useTransferRecipientSearch(
  selectRecentRecipient
)

const {
  recentRecipients,
  isRecentLoading,
  recentError,
  fetchRecentRecipients
} =
  useRecentTransferRecipients()

/**
 * 받는 사람 이름을 제거했으므로
 * 화면 자체에서는 은행 + 계좌번호만 체크
 */
const canGoNext =
  computed(
    () =>
      Boolean(
        form.value?.bankCode ??
        form.bankCode
      ) &&
      String(
        form.value
          ?.accountNumber ??
        form.accountNumber ??
        ''
      ).trim().length > 0
  )

/**
 * form이 reactive인지 ref인지에 상관없이
 * accountNumber 값 읽기
 */
function getAccountNumber() {
  return String(
    form.value
      ?.accountNumber ??
    form.accountNumber ??
    ''
  )
}

/**
 * 계좌번호 변경
 */
function setAccountNumber(
  value
) {
  if (form.value) {
    form.value.accountNumber =
      value
  } else {
    form.accountNumber =
      value
  }
}

/**
 * 은행 변경
 */
function handleBankChange() {
  clearFieldError(
    'bankCode'
  )

  /**
   * 은행을 누르면
   * 계좌 키패드는 닫아둠
   */
  showAccountKeypad.value =
    false
}

/**
 * 키패드 열기
 */
function openAccountKeypad() {
  clearFieldError(
    'accountNumber'
  )

  showAccountKeypad.value =
    true
}

/**
 * 계좌번호 숫자 입력
 *
 * 계좌번호는 0으로 시작할 수도 있으므로
 * 금액 입력처럼 앞자리 0을 막지 않는다.
 */
function appendAccountDigit(
  value
) {
  clearFieldError(
    'accountNumber'
  )

  const current =
    getAccountNumber()

  /**
   * 비정상적으로 긴 입력만 방지
   */
  if (
    current.length +
      value.length >
    20
  ) {
    return
  }

  setAccountNumber(
    current + value
  )
}

/**
 * 계좌번호 한 자리 삭제
 */
function deleteAccountDigit() {
  clearFieldError(
    'accountNumber'
  )

  const current =
    getAccountNumber()

  setAccountNumber(
    current.slice(
      0,
      -1
    )
  )
}

/**
 * 다음
 */
async function handleNext() {
  if (!canGoNext.value) {
    validateBank()
    validateAccountNumber()

    return
  }

  /**
   * 키패드를 닫고 검색
   */
  showAccountKeypad.value =
    false

  await searchRecipient()
}
</script>