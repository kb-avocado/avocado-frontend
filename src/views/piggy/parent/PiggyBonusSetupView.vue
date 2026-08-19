<template>
  <div class="h-screen overflow-hidden flex flex-col bg-white">
    <!-- 뒤로가기 버튼 설정을 위해 헤더와 Nav import -->
    <AppHeader title="보너스 설정" show-back :show-bell="false" :show-avatar="false" @click-back="router.back()" />

    <div class="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-6">
      <!-- 목표 정보 -->
      <div v-if="piggyBank">
        <h2 class="ml-2 text-xl font-bold text-gray-900">아이의 새 목표를 확인하세요</h2>
        <p class="ml-2 mt-2 mb-3 text-sm text-gray-500">
          목표 달성 시 설정한 보너스가 추가 지급됩니다.
        </p>
        <div
          class="rounded-2xl bg-white border border-[#E8EDE4] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] p-5 space-y-4">
          <div class="flex flex-col items-center gap-2">
            <div class="w-14 h-14 rounded-full bg-avocado-100 flex items-center justify-center">
              <Gamepad2 :size="26" class="text-avocado-600" />
            </div>
            <div class="text-center">
              <p class="text-lg font-semibold text-avocado-900 mt-1">{{ childName }}</p>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted">목표</p>
            <p class="text-xl font-bold text-gray-600">{{ piggyBank.name }}</p>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted">목표 금액</p>
            <p class="text-xl font-extrabold text-avocado-600">{{ formattedTargetAmount }}</p>
          </div>

          <div class="flex items-center gap-2 bg-avocado-50 rounded-xl p-3">
            <Info :size="16" class="text-avocado-600 shrink-0" />
            <p class="text-xs text-muted">
              아이는 저금통을 다 채우더라도 저금통 생성일로부터<br />
              최소 7일간은 보너스를 받을 수 없습니다.
            </p>
          </div>
        </div>
      </div>

      <!-- 보너스 타입 토글 -->
      <div>
        <p class="ml-2 text-sm font-medium text-avocado-900 mb-2">보너스 방식 선택</p>
        <div class="mx-2 flex rounded-full bg-gray-100 border border-gray-200 p-1">
          <button v-for="option in BONUS_TYPE_OPTIONS" :key="option.value" type="button"
            class="flex-1 h-9 rounded-full text-sm font-medium transition-colors" :style="bonusType === option.value
                ? { backgroundColor: '#4C4C4C', color: '#FFFFFF' }
                : { backgroundColor: 'transparent', color: '#72796B' }
              " @click="bonusType = option.value">
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- 값 입력 -->
      <div v-if="bonusType">
        <label class="ml-2 text-sm font-medium text-avocado-900 mb-2 block">
          {{ bonusType === BONUS_TYPE.RATE ? '응원 보너스 설정 (%)' : '추가 지원금 (원)' }}
        </label>
        <div class="mx-2 rounded-xl border border-gray-200 p-3 flex items-center">
          <input :value="bonusValue" type="text" inputmode="numeric" class="flex-1 outline-none text-sm text-gray-900"
            :placeholder="bonusType === BONUS_TYPE.RATE ? '예: 5' : '예: 10000'" @input="onBonusValueInput" />
          <span class="text-sm text-muted">{{ bonusType === BONUS_TYPE.RATE ? '%' : '원' }}</span>
        </div>
        <p v-if="bonusValue && !isValueValid" class="mx-2 text-xs text-red-500 mt-1">
          {{
            bonusType === BONUS_TYPE.RATE
              ? '1~100 사이의 숫자를 입력해주세요.'
              : '0보다 큰 금액을 입력해주세요.'
          }}
        </p>
      </div>

      <p v-if="submitError" class="text-sm text-red-500">{{ submitError }}</p>

      <!-- 경고 안내 + 승인 버튼을 하나의 그룹으로 묶어서 간격을 좁힘 -->
      <div class="flex flex-col gap-3">
        <div class="flex items-start gap-2 bg-avocado-50 rounded-xl p-4">
          <ShieldCheck :size="18" class="text-avocado-600 mt-0.5 shrink-0" />
          <p class="text-xs text-avocado-900 leading-relaxed">
            <span class="font-bold">정액형</span> 또는 <span class="font-bold">비율형</span> 중
            하나를 선택하여 아이를 응원할 수 있습니다.

            <span class="font-bold">비율형</span> 보너스는 아이에게
            <span class="font-bold">이자</span> 개념을 익히게 하기 좋습니다. <br />

            보너스는 한번 설정하면 수정이
            <span class="font-bold">불가능</span>하니 신중하게 설정해주세요.
          </p>
        </div>

        <div class="p-4">
          <BaseButton variant="primary" class="w-full gap-2" :disabled="!canSubmit" @click="handleSubmit">
            <span>{{ isSubmitting ? '설정 중...' : '승인하기' }}</span>
            <CircleCheck v-if="!isSubmitting" :size="18" />
          </BaseButton>
        </div>
      </div>
    </div>

    <BottomNavBar />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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

/* 사용자 정보 */
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()

/* 가져온 저금통의 데이터 */
const { piggyBank } = usePiggyBankDetail(route.params.id, route.params.childId)

const authStore = useAuthStore()

/* 로그인 응답의 child 목록에서 childId로 실제 아이 이름을 찾기 */
const childName = computed(
  () =>
    (authStore.user?.child ?? []).find((child) => String(child.id) === String(route.params.childId))
      ?.name ?? '아이'
)

/* 토글에 넘길 옵션 목록 (정액형이 기본값이 되도록 먼저 배치) */
const BONUS_TYPE_OPTIONS = [
  { label: '정액형 보너스', value: BONUS_TYPE.FIXED },
  { label: '비율형 보너스', value: BONUS_TYPE.RATE }
]

/* 기본값은 정액형 보너스로 시작 (한 번 설정 후에는 수정 불가) */
const bonusType = ref(BONUS_TYPE.FIXED)

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

/* 토글로 타입이 바뀔 때마다 입력값/에러 메세지 초기화 */
function resetBonusValueOnTypeChange() {
  bonusValue.value = ''
  submitError.value = ''
}
watch(bonusType, resetBonusValueOnTypeChange)

/* 숫자만 입력되도록 필터링 (type=number의 화살표/마이너스 입력 문제 방지) */
function onBonusValueInput(event) {
  bonusValue.value = event.target.value.replace(/[^\d]/g, '')
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
        piggyBankBonusType: bonusType.value,
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
