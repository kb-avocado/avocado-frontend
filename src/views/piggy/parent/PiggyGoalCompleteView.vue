<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppHeader title="저금통" show-back :show-bell="false" :show-avatar="false" @click-back="router.back()" />

    <div class="flex-1 p-4 space-y-6" v-if="piggyBank">
      <h2 class="text-2xl font-bold text-avocado-900 text-center mt-2">축하해요! 저금 완료</h2>

      <div class="rounded-2xl border border-avocado-100 shadow-sm p-4 text-center space-y-2">
        <span
          class="inline-flex items-center gap-1 bg-avocado-100 text-avocado-600 text-xs font-semibold rounded-full px-3 py-1">
          <Star :size="12" /> 목표 달성
        </span>
        <p class="text-lg font-bold text-avocado-900">{{ piggyBank.name }}</p>
        <p class="text-sm text-muted">성공적으로 저금을 마쳤어요!</p>
      </div>

      <div class="rounded-2xl bg-orange-400 p-6 text-center space-y-3">
        <p class="text-sm text-white/90">약속한 지원금</p>
        <p class="text-4xl font-extrabold text-white">
          {{ bonusAmount.toLocaleString('ko-KR') }}<span class="text-xl font-bold">원</span>
        </p>
        <div class="inline-flex items-center gap-2 bg-white/20 text-white text-sm rounded-full px-4 py-2">
          <CreditCard :size="14" /> 보호자님
          <ArrowRight :size="14" />
          <Smile :size="14" /> {{ childWalletLabel }}
        </div>
      </div>

      <div>
        <p class="text-sm font-medium text-avocado-900 mb-2">축하 메시지 작성</p>
        <textarea v-model="message" :maxlength="MAX_LENGTH" rows="4" placeholder="아이에게 축하 메시지를 보내주세요."
          class="w-full border border-avocado-300 rounded-xl p-3 text-[15px] outline-none resize-none"></textarea>
        <p class="text-xs text-muted text-right mt-1">{{ message.length }}/{{ MAX_LENGTH }}</p>
      </div>

      <div>
        <p class="text-sm font-medium text-avocado-900 mb-2">빠른 응원 문구</p>
        <div class="grid grid-cols-2 gap-2">
          <button v-for="phrase in quickPhrases" :key="phrase" type="button"
            class="text-sm text-avocado-600 bg-avocado-50 border border-avocado-100 rounded-full py-2 px-3 hover:bg-avocado-100"
            @click="selectQuickPhrase(phrase)">
            {{ phrase }}
          </button>
        </div>
      </div>

      <p v-if="submitError" class="text-sm text-red-500">{{ submitError }}</p>
    </div>

    <div class="p-4">
      <BaseButton variant="primary" class="w-full gap-2" :disabled="!canSubmit" @click="handleSubmit">
        <span>{{ isSubmitting ? '처리 중...' : '보너스 보내기' }}</span>
        <Send v-if="!isSubmitting" :size="18" />
      </BaseButton>
    </div>

    <BottomNavBar />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Star, CreditCard, ArrowRight, Smile, Send } from 'lucide-vue-next'

/* 뒤로가기 활성화를 위한 헤더와 NAV import */
import AppHeader from '@/components/common/AppHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'

import { sendCheerMessage } from '@/api/piggy'

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
  '우와 최고야!',
  '이걸 다 모으다니!! 대단해~',
  '너무 축하해~!!!',
  '너무 잘했어!!!',
  '대견해 우리 아들',
  '대견해 우리 딸'
]

/* 찾은 저금통 데이터 확보 */
const { piggyBank } = usePiggyBankDetail(route.params.id)

/* name은 임시 데이터 나중에 user db에서 가져와야함 */
const childWalletLabel = '민지의 지갑'

/* 보너스 계산 */
const bonusAmount = computed(() => {
  const bonus = piggyBank.value?.bonus

  // 보너스가 없을경우 0 리턴
  if (!bonus) return 0

  // RATE 타입일 경우 계산
  if (bonus.type === 'RATE') {
    return Math.floor(((piggyBank.value?.targetAmount ?? 0) * bonus.rate) / 100)
  }
  return bonus.amount ?? 0
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

    // 메세지 전송 성공 후 송금하기 페이지로 갈 때 가지고 갈 파라미터
    // 목업에 지갑ID 추가 필요
    router.push({
      name: 'transfer',

      // transfer.js의 검증 로직 사용
      query: createTransferQuery({
        recipientType: TRANSFER_RECIPIENT_TYPE.WALLET,
        recipientId: piggyBank.value.walletId,
        amount: bonusAmount.value
      })
    })
  } catch (e) {
    submitError.value = '축하 메시지 전송에 실패했어요. 다시 시도해주세요.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
