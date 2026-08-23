<template>
  <div>
    <!-- 삭제하기 버튼: 기본 outline 색상(text-avocado-600 등)을 !important로 확실히 덮어씀 -->
    <BaseButton
      variant="outline"
      class="w-full !text-[#F34242] !border-[#F34242]"
      @click="showModal = true"
    >
      저금통 삭제하기
    </BaseButton>

    <!-- 삭제 확인 모달 -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6"
      @click.self="showModal = false"
    >
      <div class="w-full max-w-[300px] rounded-3xl bg-[#F3F4F6] p-6 text-center shadow-xl">
        <img
          :src="sadAvocadoImage"
          alt=""
          aria-hidden="true"
          class="w-24 h-24 mx-auto mb-4 object-contain"
        />
        <h3 class="text-base font-bold text-[#191D17] mb-2">저금통을 삭제하시겠습니까?</h3>
        <p class="text-xs text-[#43483E] leading-relaxed mb-6">
          삭제하면 지금까지 모든 기록이 사라지고<br />다시 되돌릴 수 없어요.
        </p>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 h-10 rounded-full bg-[#BA1A1A] text-white text-sm font-bold flex items-center justify-center gap-1 disabled:opacity-50"
            :disabled="deleting"
            @click="handleDelete"
          >
            {{ deleting ? '삭제 중...' : '삭제하기' }}
          </button>
          <button
            type="button"
            class="flex-1 h-10 rounded-full bg-[#DFE4D7] text-[#43483E] text-sm font-medium"
            @click="showModal = false"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { usePiggyBankStore } from '@/stores/piggyBank'
import sadAvocadoImage from '@/assets/images/ch25.png'

const props = defineProps({
  piggyBankId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['deleted'])

const store = usePiggyBankStore()

const showModal = ref(false)
const deleting = ref(false)

async function handleDelete() {
  deleting.value = true
  try {
    await store.closePiggyBank(props.piggyBankId)
    showModal.value = false
    emit('deleted') // 삭제 성공 → 부모가 처리 (화면 이동 등)
  } catch (e) {
    alert(e.message || '삭제에 실패했어요. 다시 시도해주세요.')
  } finally {
    deleting.value = false
  }
}
</script>
