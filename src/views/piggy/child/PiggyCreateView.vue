<template>
  <div class="h-screen overflow-hidden flex flex-col bg-surface">
    <AppHeader
      title="저금통 만들기"
      show-back
      :show-bell="true"
      :show-avatar="false"
      @click-back="router.back()"
    />

    <div class="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-8 space-y-6">
      <!-- 저금 목표 이름: 신문 챌린지 답변란과 동일한 스타일 -->
      <div>
        <p class="text-sm font-medium text-[#42493C] mb-2">무엇을 위해 저금하나요?</p>
        <div class="rounded-xl border border-gray-200 p-3">
          <input
            v-model="name"
            type="text"
            :maxlength="20"
            placeholder="예: 학용품 사기"
            class="w-full text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-400"
          />
        </div>
      </div>

      <!-- 아이콘 선택 -->
      <div>
        <p class="text-sm font-medium text-[#42493C] mb-2">목표 아이콘 선택</p>
        <div class="grid grid-cols-4 gap-3 py-2">
          <button
            v-for="icon in icons"
            :key="icon"
            type="button"
            class="w-full aspect-square grid place-items-center rounded-full text-3xl transition-shadow"
            :style="{
              backgroundColor: selectedIcon === icon ? '#F1F6FF' : '#F3F3F3',
              boxShadow: selectedIcon === icon ? '0 0 12px 0 rgba(0, 0, 0, 0.3)' : 'none'
            }"
            @click="selectedIcon = icon"
          >
            {{ icon }}
          </button>
        </div>
      </div>

      <!-- 목표 금액: 저금 목표 이름과 동일한 스타일 -->
      <div>
        <p class="text-sm font-medium text-[#42493C] mb-2">목표 금액</p>
        <div class="rounded-xl border border-gray-200 p-3 flex items-center gap-2">
          <input
            v-model="targetAmount"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            class="flex-1 text-sm text-gray-900 outline-none bg-transparent"
            @input="targetAmount = String(Number(targetAmount.replace(/[^0-9]/g, '')) || '')"
          />
          <span class="text-sm text-gray-500">원</span>
        </div>
        <div class="flex gap-2 mt-3">
          <button
            v-for="quick in quickAmounts"
            :key="quick.amount"
            type="button"
            class="py-2 px-3 rounded-full text-sm font-medium"
            :style="{ backgroundColor: quick.color, color: '#626262' }"
            @click="addAmount(quick.amount)"
          >
            +{{ quick.amount.toLocaleString('ko-KR') }}원
          </button>
          <button
            type="button"
            class="py-2 px-4 rounded-full text-sm font-medium bg-gray-100 text-gray-500"
            @click="targetAmount = ''"
          >
            모두 지우기
          </button>
        </div>
      </div>

      <!-- 안내 문구: 신문 리스트 하단 안내문구와 동일한 스타일 -->
      <p class="text-[13px] font-semibold text-[#E5793A] leading-relaxed rounded-xl p-3">
        * 처음 돈 넣은 날로부터 모은 돈을 돌려받을 수 있어요!
      </p>
      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
      <!-- 목표 만들기 버튼: 신문 '활동 완료하기' 버튼과 동일한 스타일 -->
      <BaseButton
        variant="primary"
        class="w-full"
        :disabled="!canSubmit"
        @click="showConfirmModal = true"
      >
        {{ isSubmitting ? '처리 중...' : '저금통 만들기' }}
      </BaseButton>
    </div>

    <BottomNavBar />
    <!-- 생성 확인 모달 -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 z-50 grid place-items-center bg-black/40 p-6"
      @click.self="showConfirmModal = false"
    >
      <div class="w-full max-w-[300px] rounded-3xl bg-white p-6 text-center shadow-xl">
        <img
          :src="cadoseedImage"
          alt=""
          aria-hidden="true"
          class="w-24 h-24 mx-auto mb-4 object-contain"
        />
        <h3 class="text-base font-bold text-[#191D17] mb-2">저금통을 만들까요?</h3>

        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 h-10 rounded-full bg-avocado-600 text-white text-sm font-bold disabled:opacity-50"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            {{ isSubmitting ? '만드는 중...' : '만들기' }}
          </button>
          <button
            type="button"
            class="flex-1 h-10 rounded-full bg-[#DFE4D7] text-[#43483E] text-sm font-medium"
            @click="showConfirmModal = false"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle } from 'lucide-vue-next'
import AppHeader from '@/components/common/AppHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import { usePiggyBankStore } from '@/stores/piggyBank'
import cadoseedImage from '@/assets/images/cheer.png'
const router = useRouter()

const store = usePiggyBankStore()

// 목표 아이콘 (SVG: 자전거·게임·가방·책 / 스키·톱니·별·하트)
const icons = ['🚗', '🎮', '🎂', '📚', '👕', '⚽', '⭐', '❤️']
const name = ref('')
const selectedIcon = ref('🎮')
const targetAmount = ref('')

// 빠른 금액 추가 버튼: 지정된 색상 + 공통 글씨색(#626262)
const quickAmounts = [
  { amount: 1000, color: '#FDBEBE' },
  { amount: 5000, color: '#F9D9BB' },
  { amount: 10000, color: '#D4ECC0' }
]

const isSubmitting = ref(false)
const errorMessage = ref('')
const showConfirmModal = ref(false)

const canSubmit = computed(
  () => name.value.trim().length > 0 && Number(targetAmount.value) > 0 && !isSubmitting.value
)

function addAmount(amount) {
  targetAmount.value = String(Number(targetAmount.value || 0) + amount)
}

function clearAll() {
  name.value = ''
  selectedIcon.value = icons[0]
  targetAmount.value = ''
}
// 변경: 실제 생성 API 연동
async function handleSubmit() {
  if (!canSubmit.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await store.createPiggyBank({
      name: name.value.trim(),
      targetAmount: Number(targetAmount.value),
      icon: selectedIcon.value // 고른 아이콘 전송
    })
    showConfirmModal.value = false
    router.replace({ name: 'piggy' }) // 성공 → 목록으로 (목록 화면이 새로 조회함)
  } catch (e) {
    errorMessage.value = e.message || '저금통 생성에 실패했어요. 다시 시도해주세요.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.icon-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--color-avocado-600) transparent;
}

.icon-scroll::-webkit-scrollbar {
  height: 4px;
}

.icon-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.icon-scroll::-webkit-scrollbar-thumb {
  background-color: var(--color-avocado-600);
  border-radius: 999px;
}
</style>
