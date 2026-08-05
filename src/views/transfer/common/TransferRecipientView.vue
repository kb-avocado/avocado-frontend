<template>
  <main class="flex min-h-full flex-col bg-white px-4 pb-5 pt-6">
    <div>
      <h1 class="text-xl font-bold text-gray-900">누구에게 송금할까요?</h1>
      <p class="mt-2 text-sm text-gray-500">은행과 계좌번호를 입력해주세요.</p>
    </div>

    <form class="mt-8 flex flex-1 flex-col" novalidate @submit.prevent="handleSearch">
      <div class="space-y-6">
        <BankSelect
          v-model="form.bankCode"
          :banks="banks"
          :error="errors.bankCode"
          :disabled="isSearching"
          @update:model-value="clearFieldError('bankCode')"
          @blur="validateBank"
        />

        <AccountNumberInput
          v-model="form.accountNumber"
          :error="errors.accountNumber"
          :disabled="isSearching"
          @update:model-value="clearFieldError('accountNumber')"
          @blur="validateAccountNumber"
        />

        <p
          v-if="searchError"
          role="alert"
          aria-live="polite"
          class="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {{ searchError }}
        </p>

        <RecentRecipientList
          :recipients="recentRecipients"
          :loading="isRecentLoading"
          :error="recentError"
          @retry="fetchRecentRecipients"
          @select="selectRecentRecipient"
        />
      </div>

      <BaseButton
        class="mt-auto h-12 w-full rounded-xl"
        :disabled="!canSubmit || isSearching"
        @click="handleSearch"
      >
        <span
          v-if="isSearching"
          class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden="true"
        />
        {{ isSearching ? '확인 중...' : '다음' }}
      </BaseButton>
    </form>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import AccountNumberInput from '@/components/transfer/AccountNumberInput.vue'
import BankSelect from '@/components/transfer/BankSelect.vue'
import RecentRecipientList from '@/components/transfer/RecentRecipientList.vue'
import { getRecentTransferRecipients, getTransferRecipient } from '@/api/transfer'
import { TRANSFER_RECIPIENT_SEARCH_TYPE, TRANSFER_RECIPIENT_TYPE } from '@/constants'
import { useTransferStore } from '@/stores/transfer'

const router = useRouter()
const transferStore = useTransferStore()

const banks = [
  { code: 'AVOCADO', name: '아보카도 은행' },
  { code: 'KB', name: 'KB국민은행' },
  { code: 'SHINHAN', name: '신한은행' },
  { code: 'HANA', name: '하나은행' },
  { code: 'WOORI', name: '우리은행' },
  { code: 'NH', name: 'NH농협은행' },
  { code: 'KAKAO', name: '카카오뱅크' },
  { code: 'TOSS', name: '토스뱅크' }
]

const form = reactive({
  bankCode: '',
  accountNumber: ''
})

const errors = reactive({
  bankCode: '',
  accountNumber: ''
})

const isSearching = ref(false)
const searchError = ref('')
const recentRecipients = ref([])
const isRecentLoading = ref(false)
const recentError = ref('')
let requestSequence = 0
let requestController = null
let recentRequestSequence = 0
let recentRequestController = null

const canSubmit = computed(
  () =>
    form.bankCode !== '' && form.accountNumber !== '' && !errors.bankCode && !errors.accountNumber
)

function clearFieldError(field) {
  errors[field] = ''
  searchError.value = ''
}

function validateAccountNumber() {
  if (!form.accountNumber) {
    errors.accountNumber = '계좌번호를 입력해주세요.'
    return false
  }

  errors.accountNumber = ''
  return true
}

function validateBank() {
  errors.bankCode = form.bankCode ? '' : '은행을 선택해주세요.'
  return !errors.bankCode
}

function validateForm() {
  const isBankValid = validateBank()
  const isAccountNumberValid = validateAccountNumber()
  return isBankValid && isAccountNumberValid
}

function unwrapResponse(response) {
  const body = response?.data
  return body?.data ?? body
}

function normalizeRecipient(data, fallback = {}) {
  if (!data || typeof data !== 'object') return null

  const name = data.recipientName ?? data.name
  const accountNumber = data.accountNumber ?? fallback.accountNumber ?? data.maskedAccountNumber

  if (!name || !accountNumber) return null

  return {
    recipientId: data.recipientId ?? data.accountId ?? data.walletId ?? data.id ?? null,
    recipientType: data.recipientType ?? TRANSFER_RECIPIENT_TYPE.ACCOUNT,
    name,
    bankCode: data.bankCode ?? fallback.bankCode ?? '',
    bankName: data.bankName ?? fallback.bankName ?? '',
    accountNumber,
    maskedAccountNumber: data.maskedAccountNumber ?? accountNumber,
    userCode: data.userCode ?? ''
  }
}

function normalizeRecentRecipients(data) {
  const items = Array.isArray(data) ? data : (data?.content ?? data?.recipients ?? [])

  return items
    .map((item) => normalizeRecipient(item))
    .filter(Boolean)
    .map((recipient, index) => ({
      ...recipient,
      key: recipient.recipientId ?? `${recipient.accountNumber}-${index}`
    }))
}

function getSearchErrorMessage(error) {
  const status = error?.response?.status

  if (status === 404) return '일치하는 송금 대상을 찾을 수 없어요.'
  if (status >= 500) return '서버에 문제가 발생했어요. 잠시 후 다시 시도해주세요.'

  return error?.response?.data?.message ?? '송금 대상을 확인하지 못했어요. 다시 시도해주세요.'
}

async function handleSearch() {
  if (isSearching.value || !validateForm()) return

  const currentSequence = ++requestSequence
  requestController?.abort()
  requestController = new AbortController()

  isSearching.value = true
  searchError.value = ''

  try {
    const response = await getTransferRecipient(
      TRANSFER_RECIPIENT_SEARCH_TYPE.ACCOUNT_NUMBER,
      form.accountNumber,
      { signal: requestController.signal }
    )

    if (currentSequence !== requestSequence) return

    const selectedBank = banks.find((bank) => bank.code === form.bankCode)
    const recipient = normalizeRecipient(unwrapResponse(response), {
      bankCode: form.bankCode,
      bankName: selectedBank?.name,
      accountNumber: form.accountNumber
    })

    if (!recipient) {
      searchError.value = '송금 대상 정보를 확인할 수 없어요.'
      return
    }

    transferStore.setRecipient(recipient)
    await router.push({ name: 'transfer-amount' })
  } catch (error) {
    if (currentSequence !== requestSequence || error?.code === 'ERR_CANCELED') return
    searchError.value = getSearchErrorMessage(error)
  } finally {
    if (currentSequence === requestSequence) {
      isSearching.value = false
      requestController = null
    }
  }
}

async function fetchRecentRecipients() {
  const currentSequence = ++recentRequestSequence
  recentRequestController?.abort()
  recentRequestController = new AbortController()

  isRecentLoading.value = true
  recentError.value = ''

  try {
    const response = await getRecentTransferRecipients({
      signal: recentRequestController.signal
    })

    if (currentSequence !== recentRequestSequence) return
    recentRecipients.value = normalizeRecentRecipients(unwrapResponse(response))
  } catch (error) {
    if (currentSequence !== recentRequestSequence || error?.code === 'ERR_CANCELED') return

    recentRecipients.value = []
    recentError.value =
      error?.response?.status >= 500
        ? '서버 문제로 최근 내역을 불러오지 못했어요.'
        : '최근 송금 내역을 불러오지 못했어요.'
  } finally {
    if (currentSequence === recentRequestSequence) {
      isRecentLoading.value = false
      recentRequestController = null
    }
  }
}

async function selectRecentRecipient(recipient) {
  transferStore.setRecipient(recipient)
  await router.push({ name: 'transfer-amount' })
}

onMounted(fetchRecentRecipients)

onBeforeUnmount(() => {
  requestSequence += 1
  requestController?.abort()
  recentRequestSequence += 1
  recentRequestController?.abort()
})
</script>
