<template>
  <section aria-labelledby="recent-recipient-title">
    <div class="mb-3 flex items-center justify-between">
      <h2 id="recent-recipient-title" class="text-sm font-semibold text-gray-800">최근 보낸 분</h2>
      <span v-if="!loading && recipients.length" class="text-xs text-avocado-600">
        {{ recipients.length }}명
      </span>
    </div>

    <div v-if="loading" class="space-y-3" aria-live="polite" aria-busy="true">
      <div v-for="index in 3" :key="index" class="h-[68px] animate-pulse rounded-2xl bg-gray-100" />
      <span class="sr-only">최근 송금 대상을 불러오는 중입니다.</span>
    </div>

    <div v-else-if="error" class="rounded-2xl bg-gray-50 px-4 py-5 text-center" role="status">
      <p class="text-sm text-gray-500">{{ error }}</p>
      <button
        type="button"
        class="mt-2 text-sm font-semibold text-avocado-600 underline-offset-2 hover:underline"
        @click="$emit('retry')"
      >
        다시 불러오기
      </button>
    </div>

    <p
      v-else-if="!recipients.length"
      class="rounded-2xl bg-gray-50 px-4 py-7 text-center text-sm text-gray-500"
    >
      없음
    </p>

    <ul v-else class="space-y-3">
      <li v-for="recipient in recipients" :key="recipient.key">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-3 text-left shadow-[0_4px_14px_rgba(54,106,27,0.10)] transition hover:bg-avocado-50 active:bg-avocado-100"
          @click="$emit('select', recipient)"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-avocado-600 text-sm font-semibold text-white"
            aria-hidden="true"
          >
            {{ getInitial(recipient.name) }}
          </span>

          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-gray-900">
              {{ recipient.name }}
            </span>
            <span class="mt-0.5 block truncate text-xs text-gray-500">
              {{ getAccountLabel(recipient) }}
            </span>
          </span>

          <ChevronRight class="h-4 w-4 shrink-0 text-avocado-600" aria-hidden="true" />
          <span class="sr-only">선택</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ChevronRight } from 'lucide-vue-next'

defineProps({
  recipients: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' }
})

defineEmits(['retry', 'select'])

function getInitial(name) {
  return (
    String(name ?? '')
      .trim()
      .charAt(0) || '받'
  )
}

function getAccountLabel(recipient) {
  return [recipient.bankName, recipient.maskedAccountNumber ?? recipient.accountNumber]
    .filter(Boolean)
    .join(' ')
}
</script>
