<template>
  <div class="h-screen overflow-hidden flex flex-col bg-white">
    <AppHeader
      title="보너스 설정"
      show-back
      :show-bell="false"
      :show-avatar="false"
      @click-back="router.back()"
    />

    <div
      data-keypad-scroll-container
      class="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-6"
    >
      <!-- 목표 정보 -->
      <div v-if="piggyBank">
        <h2 class="ml-2 text-xl font-bold text-gray-900">
          아이의 새 목표를 확인하세요
        </h2>

        <p class="ml-2 mt-2 mb-3 text-sm text-gray-500">
          목표 달성 시 설정한 보너스가 추가 지급됩니다.
        </p>

        <div
          class="rounded-2xl bg-white border border-[#E8EDE4]
                 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)]
                 p-5 space-y-4"
        >
          <!-- 아이 -->
          <div class="flex flex-col items-center gap-2">
            <div
              class="w-14 h-14 rounded-full bg-avocado-100
                     flex items-center justify-center"
            >
              <Gamepad2
                :size="26"
                class="text-avocado-600"
              />
            </div>

            <div class="text-center">
              <p class="text-lg font-semibold text-avocado-900 mt-1">
                {{ childName }}
              </p>
            </div>
          </div>

          <!-- 목표 -->
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted">
              목표
            </p>

            <p class="text-xl font-bold text-gray-600">
              {{ piggyBank.name }}
            </p>
          </div>

          <!-- 목표 금액 -->
          <div class="flex items-center justify-between">
            <p class="text-sm text-muted">
              목표 금액
            </p>

            <p class="text-xl font-extrabold text-avocado-600">
              {{ formattedTargetAmount }}
            </p>
          </div>

          <!-- 7일 안내 -->
          <div
            class="flex items-center gap-3 rounded-xl p-3"
          >
            <img
              :src="avocadoSeedImage"
              alt="아보카도 씨"
              class="w-9 h-9 object-contain shrink-0"
            />

            <p class="text-xs text-gray-500 leading-relaxed">
              아이는 저금통을 다 채우더라도 저금통 생성일로부터
              <br />
              최소 7일간은 보너스를 받을 수 없어요.
            </p>
          </div>
        </div>
      </div>

      <!-- 보너스 방식 선택 -->
      <div>
        <p
          class="ml-2 text-sm font-medium text-avocado-900 mb-2"
        >
          보너스 방식 선택
        </p>

        <div
          class="mx-2 flex rounded-full bg-gray-100
                 border border-gray-200 p-1"
        >
          <button
            v-for="option in BONUS_TYPE_OPTIONS"
            :key="option.value"
            type="button"
            class="flex-1 h-9 rounded-full text-sm
                   font-medium transition-colors"
            :style="
              bonusType === option.value
                ? {
                    backgroundColor: '#4C4C4C',
                    color: '#FFFFFF'
                  }
                : {
                    backgroundColor: 'transparent',
                    color: '#72796B'
                  }
            "
            @click="changeBonusType(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- 보너스 값 입력 -->
      <div v-if="bonusType">
        <label
          class="ml-2 text-sm font-medium
                 text-avocado-900 mb-2 block"
        >
          {{
            bonusType === BONUS_TYPE.RATE
              ? '응원 보너스 설정 (%)'
              : '추가 지원금 (원)'
          }}
        </label>

        <!-- 숫자 입력 영역 -->
        <button
          type="button"
          data-keypad-trigger
          :data-keypad-active="
            showKeypad
              ? 'true'
              : 'false'
          "
          class="mx-2 w-[calc(100%-1rem)] rounded-xl border
                 bg-white p-4 flex items-center transition-colors"
          :class="
            showKeypad
              ? 'border-avocado-500 ring-1 ring-avocado-500'
              : 'border-gray-200'
          "
          @click="openKeypad"
        >
          <span
            class="flex-1 text-right text-xl font-bold"
            :class="
              bonusValue
                ? 'text-gray-900'
                : 'text-gray-400'
            "
          >
            {{ formattedInputValue }}
          </span>

          <span class="ml-2 text-sm text-muted">
            {{
              bonusType === BONUS_TYPE.RATE
                ? '%'
                : '원'
            }}
          </span>
        </button>

        <!-- 유효성 오류 -->
        <p
          v-if="bonusValue && !isValueValid"
          class="mx-2 text-xs text-red-500 mt-1"
        >
          {{
            bonusType === BONUS_TYPE.RATE
              ? '1~100 사이의 숫자를 입력해주세요.'
              : '0보다 큰 금액을 입력해주세요.'
          }}
        </p>
      </div>

      <!-- 저장 실패 -->
      <p
        v-if="submitError"
        class="text-sm text-red-500"
      >
        {{ submitError }}
      </p>

      <!-- 아보카도씨 Tip -->
      <div class="relative">
        <button
          type="button"
          class="flex items-center gap-2 text-left"
          @click="openTipModal"
        >
          <img
            :src="avocadoSeedImage"
            alt="아보카도 씨"
            class="w-9 h-9 object-contain shrink-0"
          />

          <span
            class="text-xs font-medium text-gray-400
                   underline underline-offset-2"
          >
            아보카도씨의
            <span class="font-semibold text-[#E5793A]">
              Tip!
            </span>
          </span>
        </button>
      </div>

      <!-- 키패드 닫혀 있을 때 승인 버튼 -->
      <div
        v-if="!showKeypad"
        class="p-4"
      >
        <BaseButton
          variant="primary"
          class="w-full gap-2"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          <span>
            {{
              isSubmitting
                ? '설정 중...'
                : '승인하기'
            }}
          </span>

          <CircleCheck
            v-if="!isSubmitting"
            :size="18"
          />
        </BaseButton>
      </div>
    </div>

    <BottomNavBar />

    <!-- 숫자 키패드 -->
    <NumberKeypadPanel
      v-model="showKeypad"
      overlay
      mode="amount"
      :disabled="isSubmitting"
      @input="appendBonusDigit"
      @delete="deleteBonusDigit"
    >
      <!-- 키패드 아래 승인하기 -->
      <div class="mt-3 px-4">
        <BaseButton
          variant="primary"
          class="w-full gap-2"
          :disabled="!canSubmit"
          @click="handleSubmit"
        >
          <span>
            {{
              isSubmitting
                ? '설정 중...'
                : '승인하기'
            }}
          </span>

          <CircleCheck
            v-if="!isSubmitting"
            :size="18"
          />
        </BaseButton>
      </div>
    </NumberKeypadPanel>

    <!-- 아보카도씨 Tip 모달 -->
    <Teleport to="body">
      <Transition name="tip-modal">
        <div
          v-if="showTipModal"
          class="fixed inset-0 z-[60] flex items-center
                 justify-center bg-black/40 px-6"
          @click.self="showTipModal = false"
        >
          <div
            class="relative w-full max-w-[300px] rounded-3xl
                   bg-white p-6 shadow-xl"
          >
            <!-- 닫기 -->
            <button
              type="button"
              class="absolute right-4 top-4 flex h-8 w-8
                     items-center justify-center rounded-full
                     bg-gray-100 text-gray-400"
              aria-label="닫기"
              @click="showTipModal = false"
            >
              <X :size="16" />
            </button>

            <!-- 아보카도씨 -->
            <img
              :src="avocadoSeedImage"
              alt="아보카도 씨"
              class="mx-auto h-14 w-14 object-contain"
            />

            <!-- 제목 -->
            <p
              class="mt-3 text-center text-base
                     font-bold text-gray-700"
            >
              아보카도씨의
              <span class="text-[#E5793A]">
                Tip!
              </span>
            </p>

            <!-- 내용 -->
            <div
              class="mt-5 rounded-2xl bg-gray-50
                     px-4 py-4"
            >
              <p
                class="text-sm leading-relaxed
                       text-gray-500"
              >
                <span class="font-bold text-gray-700">
                  정액형
                </span>
                또는
                <span class="font-bold text-gray-700">
                  비율형
                </span>
                중 하나를 선택하여 아이를 응원할 수 있어요.
              </p>

              <p
                class="mt-3 text-sm leading-relaxed
                       text-gray-500"
              >
                <span class="font-bold text-gray-700">
                  비율형
                </span>
                보너스는 아이에게
                <span class="font-bold text-gray-700">
                  이자
                </span>
                개념을 익히게 하기 좋아요.
              </p>

              <p
                class="mt-3 text-sm leading-relaxed
                       text-gray-500"
              >
                보너스는 한 번 설정하면 수정이
                <span class="font-bold text-gray-700">
                  불가능
                </span>
                하니 신중하게 설정해주세요.
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 보너스 설정 확인 -->
    <ConfirmModal
      v-model="showConfirmModal"
      variant="save"
      title="보너스 설정"
      description-prefix="보너스를"
      :highlight="formattedBonusValue"
      :description-suffix="confirmSuffix"
      confirm-label="확인"
      @confirm="confirmBonusSetup"
    />

    <!-- 성공 -->
    <ResultModal
      v-model="showSuccessModal"
      variant="success"
      title="보너스 설정 완료"
      message="저금통 보너스를 설정했어요."
      :auto-close-ms="1500"
    />

    <!-- 실패 -->
    <ResultModal
      v-model="showErrorModal"
      variant="error"
      title="보너스 설정 실패"
      message="보너스 설정에 실패했어요. 다시 시도해주세요."
    />
  </div>
</template>

<script setup>
import {
  ref,
  computed
} from 'vue'

import {
  useRoute,
  useRouter
} from 'vue-router'

import {
  Gamepad2,
  CircleCheck,
  X
} from 'lucide-vue-next'

import AppHeader from '@/components/common/AppHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'

import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ResultModal from '@/components/common/ResultModal.vue'
import NumberKeypadPanel from '@/components/common/NumberKeypadPanel.vue'

import avocadoSeedImage from '@/assets/images/cadoseed.png'

import {
  setBonus
} from '@/api/piggy'

import {
  BONUS_TYPE
} from '@/constants'

import {
  isValidAmount,
  isValidPercentage
} from '@/utils/validators'

import {
  usePiggyBankDetail
} from '@/composables/usePiggyBankDetail'

import {
  useAuthStore
} from '@/stores/auth'

const route = useRoute()
const router = useRouter()

const authStore =
  useAuthStore()

const {
  piggyBank
} = usePiggyBankDetail(
  route.params.id,
  route.params.childId
)

/**
 * 아이 이름
 */
const childName =
  computed(
    () =>
      (
        authStore.user?.child ??
        []
      ).find(
        (child) =>
          String(child.id) ===
          String(
            route.params.childId
          )
      )?.name ?? '아이'
  )

const BONUS_TYPE_OPTIONS = [
  {
    label: '정액형 보너스',
    value: BONUS_TYPE.FIXED
  },
  {
    label: '비율형 보너스',
    value: BONUS_TYPE.RATE
  }
]

const bonusType =
  ref(BONUS_TYPE.FIXED)

const bonusValue =
  ref('')

const showKeypad =
  ref(false)

const isSubmitting =
  ref(false)

const submitError =
  ref('')

const showConfirmModal =
  ref(false)

const showSuccessModal =
  ref(false)

const showErrorModal =
  ref(false)

/**
 * Tip 모달
 */
const showTipModal =
  ref(false)

/**
 * 목표 금액
 */
const formattedTargetAmount =
  computed(() => {
    const value =
      Number(
        piggyBank.value
          ?.targetAmount ?? 0
      )

    return `${value.toLocaleString(
      'ko-KR'
    )}원`
  })

/**
 * 입력 영역 표시값
 */
const formattedInputValue =
  computed(() => {
    const value =
      Number(
        bonusValue.value || 0
      )

    if (
      bonusType.value ===
      BONUS_TYPE.RATE
    ) {
      return String(value)
    }

    return value.toLocaleString(
      'ko-KR'
    )
  })

/**
 * 확인 모달 표시값
 */
const formattedBonusValue =
  computed(() => {
    const value =
      Number(
        bonusValue.value || 0
      )

    if (
      bonusType.value ===
      BONUS_TYPE.RATE
    ) {
      return `${value}%`
    }

    return `${value.toLocaleString(
      'ko-KR'
    )}원`
  })

/**
 * 조사
 */
const confirmSuffix =
  computed(() =>
    bonusType.value ===
    BONUS_TYPE.RATE
      ? '로 설정하시겠습니까?'
      : '으로 설정하시겠습니까?'
  )

/**
 * 입력값 검증
 */
const isValueValid =
  computed(() => {
    if (
      bonusType.value ===
      BONUS_TYPE.RATE
    ) {
      return isValidPercentage(
        bonusValue.value
      )
    }

    if (
      bonusType.value ===
      BONUS_TYPE.FIXED
    ) {
      return isValidAmount(
        bonusValue.value
      )
    }

    return false
  })

/**
 * 승인 버튼 활성화
 */
const canSubmit =
  computed(
    () =>
      piggyBank.value !== null &&
      bonusType.value !== null &&
      isValueValid.value &&
      !isSubmitting.value
  )

/**
 * 키패드 열기
 */
function openKeypad() {
  submitError.value = ''

  showTipModal.value = false
  showKeypad.value = true
}

/**
 * Tip 열기
 */
function openTipModal() {
  /**
   * 키패드와 Tip 모달이
   * 동시에 표시되지 않게 함
   */
  showKeypad.value = false
  showTipModal.value = true
}

/**
 * 보너스 방식 변경
 */
function changeBonusType(
  nextType
) {
  if (
    bonusType.value ===
    nextType
  ) {
    return
  }

  bonusType.value =
    nextType

  bonusValue.value =
    ''

  submitError.value =
    ''

  showKeypad.value =
    false
}

/**
 * 숫자 입력
 */
function appendBonusDigit(
  value
) {
  submitError.value = ''

  if (
    bonusValue.value === '' &&
    value === '00'
  ) {
    return
  }

  if (
    bonusValue.value === '0'
  ) {
    bonusValue.value =
      value === '00'
        ? '0'
        : value

    return
  }

  const nextValue =
    bonusValue.value + value

  /**
   * 비율형 최대 100%
   */
  if (
    bonusType.value ===
      BONUS_TYPE.RATE &&
    Number(nextValue) > 100
  ) {
    return
  }

  /**
   * 정액형 최대 9자리
   */
  if (
    bonusType.value ===
      BONUS_TYPE.FIXED &&
    nextValue.length > 9
  ) {
    return
  }

  bonusValue.value =
    nextValue
}

/**
 * 한 자리 삭제
 */
function deleteBonusDigit() {
  submitError.value = ''

  bonusValue.value =
    bonusValue.value.slice(
      0,
      -1
    )
}

/**
 * 승인 버튼
 */
function handleSubmit() {
  if (!canSubmit.value) {
    return
  }

  submitError.value = ''

  showKeypad.value = false
  showTipModal.value = false

  showConfirmModal.value =
    true
}

/**
 * 실제 보너스 저장
 */
async function confirmBonusSetup() {
  if (
    !canSubmit.value ||
    isSubmitting.value
  ) {
    return
  }

  isSubmitting.value =
    true

  submitError.value =
    ''

  try {
    await setBonus(
      piggyBank.value
        .piggyBankId,

      {
        piggyBankBonusType:
          bonusType.value,

        bonusValue:
          Number(
            bonusValue.value
          )
      },

      route.params.childId
    )

    showSuccessModal.value =
      true

    setTimeout(() => {
      router.push({
        name:
          'parent-piggy-list',

        params: {
          childId:
            route.params.childId
        }
      })
    }, 1500)

  } catch (error) {
    console.error(
      '보너스 설정 실패:',
      error
    )

    submitError.value =
      '보너스 설정에 실패했어요. 다시 시도해주세요.'

    showErrorModal.value =
      true

  } finally {
    isSubmitting.value =
      false
  }
}
</script>

<style scoped>
.tip-modal-enter-active,
.tip-modal-leave-active {
  transition:
    opacity 0.25s ease;
}

.tip-modal-enter-active > div,
.tip-modal-leave-active > div {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.tip-modal-enter-from,
.tip-modal-leave-to {
  opacity: 0;
}

.tip-modal-enter-from > div,
.tip-modal-leave-to > div {
  opacity: 0;
  transform: translateY(16px);
}
</style>