<template>
  <div class="h-screen overflow-hidden flex flex-col bg-white">
    <AppHeader
      title="응원 보내기"
      show-back
      :show-bell="false"
      :show-avatar="false"
      @click-back="router.back()"
    />

    <div class="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
      <!-- 응원 메시지 작성: 신문 챌린지 답변란과 동일한 스타일 -->
      <div>
        <p class="text-sm font-medium text-avocado-900 mb-2">응원 메시지 작성</p>
        <div class="rounded-xl border border-gray-200 p-3">
          <textarea
            v-model="message"
            :maxlength="MAX_LENGTH"
            rows="4"
            placeholder="아이가 저금을 완료할 수 있게 독려의 한 마디를 해주세요!"
            class="w-full text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-400 resize-none"
          ></textarea>
        </div>
        <p class="text-xs text-muted text-right mt-1">{{ message.length }}/{{ MAX_LENGTH }}</p>
      </div>

      <!-- 빠른 응원 문구: 동글동글 알약형, 3색 순환 -->
      <div>
        <p class="text-sm font-medium text-avocado-900 mb-2">빠른 응원 문구</p>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="(phrase, index) in quickPhrases"
            :key="phrase"
            type="button"
            class="text-sm text-gray-900 rounded-full py-4 px-4 text-center"
            :style="{
              backgroundColor: QUICK_PHRASE_COLORS[index % QUICK_PHRASE_COLORS.length],
              border: `1px solid ${QUICK_PHRASE_BORDER_COLORS[index % QUICK_PHRASE_BORDER_COLORS.length]}`
            }"
            @click="selectQuickPhrase(phrase)"
          >
            {{ phrase }}
          </button>
        </div>
      </div>
      <!-- 취소 / 보내기: 반반, 홈 화면 송금/결제 버튼과 동일한 톤 -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex-1 text-center bg-gray-100 text-gray-500 text-sm font-medium py-3 rounded-2xl border border-avocado-100"
          @click="router.back()"
        >
          취소
        </button>
        <button
          type="button"
          class="flex-1 text-center bg-avocado-600 text-white text-sm font-medium py-3 rounded-2xl disabled:opacity-50"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          {{ isSubmitting ? '전송 중...' : '보내기' }}
        </button>
      </div>
      <p v-if="submitError" class="text-sm text-red-500">{{ submitError }}</p>
    </div>

    <BottomNavBar />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/* 뒤로가기 버튼을 위한 헤더랑 NAV import */
import AppHeader from '@/components/common/AppHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'

import { sendCheerMessage } from '@/api/piggy'

const route = useRoute()
const router = useRouter()

/* 최대 200자 */
const MAX_LENGTH = 200

/* 퀵 응원 메세지 버튼 */
const quickPhrases = [
  '시작이 반!💪',
  '정말 대단해 🩵',
  '항상 응원해 🩷',
  '잘 하고 있어 😍',
  '대견해 아들 👦🏻',
  '대견해 딸 👧🏻'
]

// 빠른 응원 문구 배경색: 순서대로 세 가지 색을 반복
const QUICK_PHRASE_COLORS = ['#FFF6F6', '#F1F6FF', '#FFFFFA']
// 위 배경색보다 살짝 진한 톤으로 맞춘 외곽선 색 (같은 순서로 대응)
const QUICK_PHRASE_BORDER_COLORS = ['#E8B3B3', '#B8CFEF', '#DDD9A0']

const message = ref('')
const isSubmitting = ref(false)
const submitError = ref('')

/* 응원 메세지의 내용이 없거나 앞 뒤 공백 확인 */
const canSubmit = computed(() => message.value.trim().length > 0 && !isSubmitting.value)

/* 퀵 메뉴를 누르면 해당 텍스트로 value 값 변경 */
function selectQuickPhrase(phrase) {
  message.value = phrase
}

/* 응원 보내기 함수 */
async function handleSubmit() {
  if (!canSubmit.value) return

  isSubmitting.value = true
  submitError.value = ''
  try {
    await sendCheerMessage(route.params.id, { message: message.value })

    // 응원 메세지 전송 후 목록 화면으로 이동
    router.back()
  } catch (e) {
    submitError.value = '응원 메시지 전송에 실패했어요. 다시 시도해주세요.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
