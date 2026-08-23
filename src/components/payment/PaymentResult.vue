<template>
  <section
    class="flex min-h-full flex-col px-6 py-10 text-center"
    :aria-labelledby="titleId"
    :role="status === 'failure' ? 'alert' : 'status'"
  >
    <div class="flex flex-1 flex-col items-center justify-center">
      <div
        class="flex h-24 w-24 items-center justify-center rounded-full"
        :class="resultTheme.iconBackground"
        aria-hidden="true"
      >
        <component
          :is="resultTheme.icon"
          class="h-14 w-14"
          :class="resultTheme.iconColor"
          :stroke-width="2.5"
        />
      </div>

      <h2 :id="titleId" class="mt-7 text-2xl font-bold text-gray-900">
        {{ displayedTitle }}
      </h2>

      <p v-if="description" class="mt-3 whitespace-pre-line text-sm leading-6 text-gray-500">
        {{ description }}
      </p>

      <dl v-if="hasPaymentDetails" class="mt-7 w-full rounded-2xl bg-gray-50 p-5 text-left">
        <div v-if="amount !== null" class="flex items-center justify-between gap-4">
          <dt class="text-sm text-gray-500">결제 금액</dt>
          <dd class="text-xl font-bold text-gray-900">{{ formattedAmount }}원</dd>
        </div>

        <div
          v-if="merchantName"
          class="flex items-center justify-between gap-4"
          :class="{ 'mt-3': amount !== null }"
        >
          <dt class="text-sm text-gray-500">사용처</dt>
          <dd class="truncate text-sm font-medium text-gray-700">
            {{ merchantName }}
          </dd>
        </div>
      </dl>

      <div v-if="$slots.default" class="mt-4 w-full">
        <slot />
      </div>

      <BaseButton class="mt-10 h-12 w-full text-base" :disabled="disabled" @click="emit('confirm')">
        {{ displayedButtonText }}
      </BaseButton>
    </div>
  </section>
</template>

<script setup>
import { computed, useId } from 'vue'
import { CircleCheck, CircleX } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['success', 'failure'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    default: null,
    validator: (value) => value === null || value >= 0
  },
  merchantName: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits({
  confirm: () => true
})

const titleId = useId()

const displayedTitle = computed(() => {
  if (props.title) return props.title

  return props.status === 'success' ? '결제가 완료됐어요' : '결제하지 못했어요'
})

const displayedButtonText = computed(() => {
  if (props.buttonText) return props.buttonText

  return props.status === 'success' ? '확인' : '돌아가기'
})

const formattedAmount = computed(() => props.amount?.toLocaleString('ko-KR'))

const hasPaymentDetails = computed(() => props.amount !== null || Boolean(props.merchantName))

const resultTheme = computed(() =>
  props.status === 'success'
    ? {
        icon: CircleCheck,
        iconBackground: 'bg-avocado-100',
        iconColor: 'text-avocado-600'
      }
    : {
        icon: CircleX,
        iconBackground: 'bg-red-50',
        iconColor: 'text-red-500'
      }
)
</script>
