<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- 뒤로가기 버튼 설정을 위해 헤더와 Nav import -->
    <AppHeader title="보상 설정" show-back :show-bell="false" :show-avatar="false" @click-back="router.back()" />

    <div class="flex-1 p-4 space-y-6">
      <!-- 목표 정보 -->
      <div v-if="piggyBank">
        <h2 class="text-xl font-bold text-avocado-900 mb-3">아이의 새 목표를 확인하세요</h2>
        <div class="rounded-2xl border border-avocado-100 shadow-sm p-4 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted">아이 이름</p>
              <p class="text-lg font-semibold text-avocado-900 mt-1">{{ childName }}</p>
            </div>
            <div class="w-12 h-12 rounded-full bg-avocado-100 flex items-center justify-center">
              <Gamepad2 :size="22" class="text-avocado-600" />
            </div>
          </div>

          <hr class="border-avocado-100" />

          <div class="flex items-center justify-between">
            <p class="text-sm text-muted">목표</p>
            <p class="text-[15px] font-medium text-avocado-900">{{ piggyBank.name }}</p>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted">목표 금액</p>
            <p class="text-lg font-bold text-avocado-600">{{ formattedTargetAmount }}</p>
          </div>

          <div class="flex items-start gap-2 bg-avocado-50 rounded-xl p-3">
            <Info :size="16" class="text-avocado-600 mt-0.5 shrink-0" />
            <p class="text-xs text-muted">목표 당 최소 저축 기한은 일주일로 고정됩니다.</p>
          </div>
        </div>
      </div>
      <!-- 보너스 타입 토글 -->
      <div>
        <p class="text-sm font-medium text-avocado-900 mb-2">보너스 방식 선택</p>
        <div class="flex rounded-full bg-avocado-50 border border-avocado-300 p-1">
          <button type="button" class="flex-1 h-9 rounded-full text-sm font-medium transition-colors" :class="bonusType === BONUS_TYPE.RATE ? 'bg-avocado-100 text-avocado-600' : 'text-muted'
            " @click="selectBonusType(BONUS_TYPE.RATE)">
            응원 보너스 설정
          </button>
          <button type="button" class="flex-1 h-9 rounded-full text-sm font-medium transition-colors" :class="bonusType === BONUS_TYPE.FIXED ? 'bg-avocado-100 text-avocado-600' : 'text-muted'
            " @click="selectBonusType(BONUS_TYPE.FIXED)">
            추가 지원금
          </button>
        </div>
      </div>
      <!-- 값 입력 -->
      <div v-if="bonusType">
        <label class="text-sm font-medium text-avocado-900 mb-2 block">
          {{ bonusType === BONUS_TYPE.RATE ? '응원 보너스 설정 (연율 %)' : '추가 지원금 (정액)' }}
        </label>
        <div class="flex items-center border border-avocado-300 rounded-xl px-3 h-11">
          <input v-model="bonusValue" type="number" inputmode="numeric" class="flex-1 outline-none text-[15px]"
            :placeholder="bonusType === BONUS_TYPE.RATE ? '예: 5' : '예: 10000'" />
          <span class="text-sm text-muted">{{ bonusType === BONUS_TYPE.RATE ? '%' : '원' }}</span>
        </div>
        <p v-if="bonusValue && !isValueValid" class="text-xs text-red-500 mt-1">
          {{
            bonusType === BONUS_TYPE.RATE
              ? '1~100 사이의 숫자를 입력해주세요.'
              : '0보다 큰 금액을 입력해주세요.'
          }}
        </p>
        <p class="text-xs text-muted mt-3">목표 달성 시 설정한 보너스가 추가 지급됩니다.</p>
      </div>

      <p v-if="submitError" class="text-sm text-red-500">{{ submitError }}</p>

      <div class="flex items-start gap-2 bg-avocado-50 rounded-xl p-4">
        <ShieldCheck :size="18" class="text-avocado-600 mt-0.5 shrink-0" />
        <p class="text-xs text-avocado-900 leading-relaxed">
          보호자님은 보너스 또는 지원금 중 하나를 선택하여 아이를 응원할 수 있습니다. 한 번 설정하면
          이후에는 변경할 수 없으니, 설정을 완료하면 승인 버튼을 눌러주세요.
        </p>
      </div>
    </div>

    <div class="p-4">
      <BaseButton variant="primary" class="w-full gap-2" :disabled="!canSubmit" @click="handleSubmit">
        <span>{{ isSubmitting ? '설정 중...' : '승인하기' }}</span>
        <CircleCheck v-if="!isSubmitting" :size="18" />
      </BaseButton>
    </div>
    <BottomNavBar />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { Gamepad2, Info, ShieldCheck, CircleCheck } from 'lucide-vue-next'

/* 헤더와 NAV */
import AppHeader from '@/components/common/AppHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'

/* piggyApi */
import { setBonus } from '@/api/piggy'

/* 보너스 타입 */
import { BONUS_TYPE } from '@/constants'

/* 이자와 정액 유효성 검사 */
import { isValidAmount, isValidPercentage } from '@/utils/validators'

/* 해당 저금통 정보를 가져오는 composables import */
import { usePiggyBankDetail } from '@/composables/usePiggyBankDetail'

const route = useRoute()
const router = useRouter()

/* 가져온 저금통의 데이터 */
const { piggyBank } = usePiggyBankDetail(route.params.id, route.params.childId)

/* 추후 사용자 db를 통해 가져올 예정 */
const childName = '민준'

/* 보너스 한번 설정 후 수정 불가에 의해서 기본값은 Null로 설정 */
const bonusType = ref(null)

/* 보너스 타이핑 값 */
const bonusValue = ref('')

/* 서버에 보너스 저장 요청 보내는 상태 여부 (true의 경우 저장 버튼 비활성화) */
const isSubmitting = ref(false)

/* 저장 요청 실패 시 에러 메세지 */
const submitError = ref('')

/* toLocaleString 숫자 포맷 */
const formattedTargetAmount = computed(
  () => `${(piggyBank.value?.targetAmount ?? 0).toLocaleString('ko-KR')}원`
)

/* 타입에 따른 validators.js 검증함수 적용 */
const isValueValid = computed(() => {
  if (bonusType.value === BONUS_TYPE.RATE) return isValidPercentage(bonusValue.value)
  if (bonusType.value === BONUS_TYPE.FIXED) return isValidAmount(bonusValue.value)
  return false
})

/* 저장 버튼이 활성화 되기위한 조건 (저금통 데이터가 null이 아님, 보너스 타입이 null 아님, 검증이 적용됨, 요청상태 활성화) */
const canSubmit = computed(
  () =>
    piggyBank.value !== null &&
    bonusType.value !== null &&
    isValueValid.value &&
    !isSubmitting.value
)

/* 이자 혹은 정액 토글을 누르면 타입이 지정되고 호출될 함수 */
function selectBonusType(type) {
  bonusType.value = type
  bonusValue.value = ''
  submitError.value = ''
}

/* 저장 시 실행됨 */
async function handleSubmit() {
  // 비활성화 저장 버튼을 누를 시 종료 (방어 코드)
  if (!canSubmit.value) return

  // 저장 상태 true
  isSubmitting.value = true

  // 이전 에러 메세지 초기화
  submitError.value = ''
  try {
    // setBonus의 piggyBankId와 payload 파라미터에 들어갈 값
    await setBonus(
      piggyBank.value.piggyBankId,
      {
        bonusType: bonusType.value,
        bonusValue: Number(bonusValue.value)
      },
      route.params.childId
    )

    alert('보너스 설정이 완료됐어요!')
    router.push({ name: 'parent-piggy-list', params: { childId: route.params.childId } })
  } catch (e) {
    // try 실패 시 submiError에 에러 메세지
    submitError.value = '보너스 설정에 실패했어요. 다시 시도해주세요.'
  } finally {
    // 서버 저장 요청 상태여부를 false로 수정 (true 일 경우 계속 설정 중인 상태가 됨)
    isSubmitting.value = false
  }
}
</script>
