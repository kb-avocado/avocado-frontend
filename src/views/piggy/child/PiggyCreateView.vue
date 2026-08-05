<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppHeader
      title="저금통 만들기"
      show-back
      :show-bell="true"
      :show-avatar="false"
      @click-back="router.back()"
    />

    <div class="flex-1 px-5 pb-8 space-y-6">
      <!-- 선택 아이콘 미리보기 -->
      <div class="flex justify-center pt-4">
        <div
          class="w-24 h-24 grid place-items-center rounded-full bg-white border-2 border-[#B6F393] text-4xl shadow-sm"
        >
          {{ selectedIcon }}
        </div>
      </div>

      <!-- 저금 목표 이름 -->
      <div>
        <p class="text-sm font-medium text-[#42493C] mb-2">무엇을 위해 저금하나요?</p>
        <div
          class="flex items-center gap-2 h-[54px] px-4 rounded-[11px] border-2 border-[#C2C9B8] bg-white"
        >
          <input
            v-model="name"
            type="text"
            :maxlength="20"
            placeholder="예: 닌텐도 사기"
            class="flex-1 text-[15px] outline-none bg-transparent placeholder:text-[#C2C9B8]"
          />
          <Pencil :size="18" class="text-[#72796B]" />
        </div>
      </div>

      <!-- 아이콘 선택 -->
      <div>
        <p class="text-sm font-medium text-[#42493C] mb-2">목표 아이콘 선택</p>
        <div class="rounded-[12px] bg-[#F3F4F6] p-4 grid grid-cols-4 gap-2">
          <button
            v-for="icon in icons"
            :key="icon"
            type="button"
            class="aspect-square grid place-items-center rounded-[16px] text-2xl transition-colors"
            :class="
              selectedIcon === icon
                ? 'bg-[#EBF4DD] shadow-sm'
                : 'bg-white border border-[#C2C9B8]/20'
            "
            @click="selectedIcon = icon"
          >
            {{ icon }}
          </button>
        </div>
      </div>

      <!-- 목표 금액 -->
      <div>
        <p class="text-sm font-medium text-[#42493C] mb-2">목표 금액</p>
        <div
          class="flex items-center gap-2 h-[54px] px-4 rounded-[11px] border-2 border-[#C2C9B8] bg-white"
        >
          <input
            v-model.number="targetAmount"
            type="number"
            min="0"
            class="flex-1 text-[15px] outline-none bg-transparent text-[#6B7280]"
          />
          <span class="text-[15px] text-[#42493C]">원</span>
        </div>
        <div class="flex gap-2 mt-3">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            type="button"
            class="flex-1 py-2 rounded-full bg-[#CFE8A9] border border-[#D2EBAC] text-[#546937] text-sm font-medium"
            @click="addAmount(amount)"
          >
            +{{ amount.toLocaleString('ko-KR') }}원
          </button>
        </div>
      </div>

      <!-- 안내 문구 -->
      <div class="flex items-start gap-2 rounded-[12px] bg-[#F3F4F6] p-4">
        <Info :size="18" class="text-[#835500] mt-0.5 shrink-0" />
        <p class="text-[13px] text-[#42493C] leading-relaxed">
          저금은 최소 7일 동안 유지돼요. 목표 금액을 다 채워도 일주일이 지나야 저금통을 열 수
          있어요!
        </p>
      </div>

      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
    </div>

    <!-- 하단 만들기 버튼 -->
    <div class="px-5 pb-4">
      <button
        type="button"
        class="w-full h-14 rounded-[12px] bg-[#78B159] text-white text-base font-bold disabled:opacity-50"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        {{ isSubmitting ? '처리 중...' : '목표 만들기' }}
      </button>
    </div>

    <BottomNavBar />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Pencil, Info } from 'lucide-vue-next'

import AppHeader from '@/components/common/AppHeader.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import { usePiggyBankStore } from '@/stores/piggyBank'

const router = useRouter()

const store = usePiggyBankStore()

// 목표 아이콘 (SVG: 자전거·게임·가방·책 / 스키·톱니·별·하트)
const icons = ['🚗', '🎮', '🎂', '📚', '👕', '⚽', '⭐', '❤️']
const name = ref('')
const selectedIcon = ref('🎮')
const targetAmount = ref(0)
const quickAmounts = [1000, 5000, 10000]

const isSubmitting = ref(false)
const errorMessage = ref('')

const canSubmit = computed(
  () => name.value.trim().length > 0 && Number(targetAmount.value) > 0 && !isSubmitting.value
)

function addAmount(amount) {
  targetAmount.value = Number(targetAmount.value || 0) + amount
}

// 변경: 실제 생성 API 연동
async function handleSubmit() {
  if (!canSubmit.value) return
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await store.createPiggyBank({
      name: name.value.trim(),
      targetAmount: Number(targetAmount.value)
      // icon은 백엔드에 없어서 안 보냄 (프론트 장식용)
    })
    router.push({ name: 'piggy' }) // 성공 → 목록으로 (목록 화면이 새로 조회함)
  } catch (e) {
    // 백엔드 에러 메시지 그대로 표시 (예: 3개 초과 시 안내)
    errorMessage.value = e.message || '저금통 생성에 실패했어요. 다시 시도해주세요.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
