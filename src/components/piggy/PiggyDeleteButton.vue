<template>
  <div>
    <!-- 삭제하기 버튼 -->
    <BaseButton
      variant="outline"
      class="w-full !text-[#F34242] !border-[#F34242]"
      @click="showDeleteConfirm = true"
    >
      저금통 삭제하기
    </BaseButton>

    <!-- 삭제 확인 -->
    <ConfirmModal
      v-model="showDeleteConfirm"
      variant="delete"
      title="저금통을 삭제할까요?"
      description="삭제하면 지금까지 모든 기록이 사라지고 다시 되돌릴 수 없어요."
      confirm-label="삭제하기"
      :disabled="deleting"
      @confirm="handleDelete"
    />

    <!-- 삭제 실패 -->
    <ResultModal
      v-model="showErrorModal"
      variant="error"
      title="삭제 실패"
      :message="errorMessage"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ResultModal from '@/components/common/ResultModal.vue'

import { usePiggyBankStore } from '@/stores/piggyBank'

const props = defineProps({
  piggyBankId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits([
  'deleted'
])

const store = usePiggyBankStore()

const showDeleteConfirm = ref(false)
const showErrorModal = ref(false)

const deleting = ref(false)
const errorMessage = ref('')

async function handleDelete() {
  if (deleting.value) {
    return
  }

  deleting.value = true
  errorMessage.value = ''

  try {
    await store.closePiggyBank(
      props.piggyBankId
    )

    emit('deleted')

  } catch (e) {
    errorMessage.value =
      e?.message ||
      '삭제에 실패했어요. 다시 시도해주세요.'

    showErrorModal.value = true

  } finally {
    deleting.value = false
  }
}
</script>