<template>
  <div class="h-screen overflow-hidden flex flex-col bg-white">
    <AppHeader
      title="저금통"
      show-back
      :show-bell="false"
      :show-avatar="false"
      @click-back="router.back()"
    />

    <div class="flex-1 min-h-0 overflow-y-auto p-4 space-y-6" v-if="piggyBank">
      <div>
        <img :src="cheerImage" alt="축하해요" class="w-48 h-48 mx-auto object-contain mb-8" />
        <p class="text-xl font-bold text-avocado-900 text-center">{{ piggyBank.name }}</p>
        <p class="text-sm text-muted text-center mt-1">성공적으로 저금을 마쳤어요!</p>
      </div>

      <div class="rounded-2xl p-6 text-center space-y-3" style="background-color: #eef0fb">
        <p class="text-sm text-gray-500">약속한 지원금</p>
        <p class="text-4xl font-extrabold" style="color: #1d1b16">
          {{ bonusAmount.toLocaleString('ko-KR') }}<span class="text-xl font-bold">원</span>
        </p>
        <div
          class="inline-flex items-center gap-2 bg-white text-gray-700 text-sm rounded-full px-4 py-2"
        >
          <CreditCard :size="14" /> 보호자
          <ArrowRight :size="14" />
          <Smile :size="14" /> {{ childWalletLabel }}
        </div>
      </div>

      <div>
        <p class="text-sm font-medium text-avocado-900 mb-2">축하 메시지 작성</p>
        <div class="rounded-xl border border-gray-200 p-3">
          <textarea
            v-model="message"
            :maxlength="MAX_LENGTH"
            rows="4"
            placeholder="아이에게 축하 메시지를 보내주세요."
            class="w-full resize-none text-sm text-gray-900 outline-none"
          ></textarea>
          <p class="text-right text-xs text-muted mt-1">{{ message.length }} / {{ MAX_LENGTH }}</p>
        </div>
      </div>

      <!-- 빠른 응원 문구: 응원보내기 화면과 동일한 알약형/3색 순환 스타일 -->
      <div>
        <p class="text-sm font-medium text-avocado-900 mb-2">빠른 응원 문구</p>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="(phrase, index) in quickPhrases"
            :key="phrase"
            type="button"
            class="h-16 text-sm text-gray-900 rounded-full px-4 flex items-center justify-center text-center"
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

      <p v-if="submitError" class="text-sm text-red-500">{{ submitError }}</p>

      <div class="p-4">
        <BaseButton
          variant="primary"
          class="w-full gap-2"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          <span>{{ isSubmitting ? '처리 중...' : '보너스 보내기' }}</span>
          <Send v-if="!isSubmitting" :size="18" />
        </BaseButton>
      </div>
    </div>

    <p v-else class="flex-1 flex items-center justify-center text-sm text-muted">불러오는 중...</p>

    <BottomNavBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Star, CreditCard, ArrowRight, Smile, Send } from 'lucide-vue-next'

/* 뒤로가기 활성화를 위한 헤더와 NAV import */
import AppHeader from '@/components/common/AppHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'

/* 상단에 크게 띄울 축하 일러스트 */
import cheerImage from '@/assets/images/cheer.png'

import { sendCheerMessage, getPiggyBankDetail, payBonus } from '@/api/piggy'
import { useAuthStore } from '@/stores/auth'

/* 보너스 -> 송금 */
import { createTransferQuery } from '@/utils/transfer'
import { TRANSFER_RECIPIENT_TYPE } from '@/constants'

/* 해당 저금통 정보를 가져오는 composables import */
import { usePiggyBankDetail } from '@/composables/usePiggyBankDetail'

const route = useRoute()
const router = useRouter()

/* 최대 200자 */
const MAX_LENGTH = 200

/* 퀵 버튼 */
const quickPhrases = [
  '우와 최고야 🩷',
  '벌써~? 대단해 💛',
  '너무 축하해~ 🫰🏻🫰🏻🫰🏻',
  '너무 잘했어 ⭐️',
  '대견해 우리 아들 👦🏻',
  '대견해 우리 딸 👧🏻'
]

// 빠른 응원 문구 배경색: 순서대로 세 가지 색을 반복 (응원보내기 화면과 동일)
const QUICK_PHRASE_COLORS = ['#FFF6F6', '#F1F6FF', '#FFFFFA']
// 위 배경색보다 살짝 진한 톤으로 맞춘 외곽선 색 (같은 순서로 대응)
const QUICK_PHRASE_BORDER_COLORS = ['#E8B3B3', '#B8CFEF', '#DDD9A0']

/* 찾은 저금통 데이터 확보 */
const { piggyBank } = usePiggyBankDetail(route.params.id, route.params.childId)

/* 보너스 정보는 상세 조회로 별도 확보 (목록 응답엔 보너스 정보가 없음) */
const bonusInfo = ref(null)

onMounted(async () => {
  try {
    const response = await getPiggyBankDetail(route.params.id, route.params.childId)
    bonusInfo.value = response.data.data
  } catch (e) {
    bonusInfo.value = null
  }
})

/* 사용자 정보 */
const authStore = useAuthStore()

const childWalletLabel = computed(() => {
  const child = authStore.user?.child?.find((c) => String(c.id) === String(route.params.childId))
  return `${child?.name ?? '아이'}의 지갑`
})

/* 보너스 계산 (실제 API 응답 구조: bonusType/bonusValue, flat) */
const bonusAmount = computed(() => {
  if (!bonusInfo.value) return 0

  const { bonusType, bonusValue } = bonusInfo.value

  if (bonusType === 'RATE') {
    return Math.floor(((piggyBank.value?.targetAmount ?? 0) * bonusValue) / 100)
  }
  if (bonusType === 'FIXED') {
    return bonusValue ?? 0
  }
  return 0
})

/* 축하 메세지 */
const message = ref('')

/* 전송 상태 */
const isSubmitting = ref(false)

/* 전송 에러 메세지 */
const submitError = ref('')

/* 공백 검사, 빈 텍스트인지 확인 */
const canSubmit = computed(
  () => piggyBank.value !== null && message.value.trim().length > 0 && !isSubmitting.value
)

/* 퀵 버튼 누를 시 해당 value 값으로 변경 */
function selectQuickPhrase(phrase) {
  message.value = phrase
}

/* 보너스 보내기 버튼 클릭 시 */
async function handleSubmit() {
  // 축하 메세지 필수로 입력해야함
  if (!canSubmit.value) return

  // 전송 상태 활성화
  isSubmitting.value = true

  // 에러 메세지 초기화
  submitError.value = ''

  try {
    // 응원 메세지 보내기 함수 활용
    await sendCheerMessage(piggyBank.value.piggyBankId, { message: message.value })
    await payBonus(piggyBank.value.piggyBankId, route.params.childId)

    // 메세지 전송 성공 후, 이미 알고 있는 아이에게 보너스 금액을 기본값으로 채운 송금 화면으로 이동
    router.push({
      name: 'parent-transfer',
      params: { childId: route.params.childId },
      query: { amount: String(bonusAmount.value) }
    })
  } catch (e) {
    submitError.value = '보너스 지급 처리에 실패했어요. 다시 시도해주세요.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
