<template>
  <div class="h-screen overflow-hidden flex flex-col bg-surface">
    <AppHeader
      title="저금통 만들기"
      show-back
      :show-bell="true"
      :show-avatar="false"
      @click-back="router.back()"
    />

    <!--
      키패드가 올라왔을 때
      목표 금액 영역이 가려지지 않도록
      NumberKeypadPanel이 이 영역을 스크롤함
    -->
    <div
      data-keypad-scroll-container
      class="flex-1 min-h-0 overflow-y-auto flex flex-col px-5 pt-4 pb-6"
    >
      <!-- 상단 입력 영역 -->
      <div>
        <!-- 저금 목표 이름 -->
        <div>
          <p class="text-sm font-medium text-[#42493C] mb-1.5">
            저금해서 무엇을 하고 싶나요?
          </p>

          <div class="rounded-xl border border-gray-200 p-2.5">
            <input
              v-model="name"
              type="text"
              :maxlength="20"
              placeholder="학용품 사기"
              class="w-full text-sm text-gray-900 outline-none bg-transparent placeholder:text-gray-400"
            />
          </div>
        </div>

        <!-- 아이콘 선택 -->
        <div class="mt-4">
          <p class="text-sm font-medium text-[#42493C] mb-1.5">
            목표 아이콘 선택
          </p>

          <div class="grid grid-cols-4 gap-4 py-1">
            <button
              v-for="icon in icons"
              :key="icon"
              type="button"
              class="w-16 h-16 mx-auto aspect-square grid place-items-center rounded-full text-2xl transition-shadow"
              :style="{
                backgroundColor:
                  selectedIcon === icon
                    ? '#F1F6FF'
                    : '#F3F3F3',

                boxShadow:
                  selectedIcon === icon
                    ? '0 0 12px 0 rgba(0, 0, 0, 0.3)'
                    : 'none'
              }"
              @click="selectedIcon = icon"
            >
              {{ icon }}
            </button>
          </div>
        </div>

        <!-- 목표 금액 -->
        <div class="mt-4">
          <p class="text-sm font-medium text-[#42493C] mb-1.5">
            목표 금액
          </p>

          <!--
            금액 표시 영역
            누르면 공통 키패드 열림
          -->
          <button
            type="button"
            data-keypad-trigger
            :data-keypad-active="
              showKeypad
                ? 'true'
                : 'false'
            "
            class="w-full flex items-baseline justify-end gap-2 py-2"
            @click="openKeypad"
          >
            <p
              class="min-w-0 flex-1 text-right text-2xl font-bold"
              :class="
                targetAmount
                  ? 'text-gray-900'
                  : 'text-gray-400'
              "
              aria-live="polite"
            >
              {{ formatMoney(targetAmount) }}
            </p>

            <span class="text-lg font-medium text-gray-700">
              원
            </span>
          </button>

          <!-- 구분선 -->
          <div
            class="border-t transition-colors"
            :class="
              showKeypad
                ? 'border-avocado-500'
                : 'border-gray-200'
            "
          />

          <!-- 빠른 금액 추가 -->
          <div class="flex items-center gap-2 mt-3">
            <button
              v-for="quick in quickAmounts"
              :key="quick.amount"
              type="button"
              class="py-2 px-3 rounded-full text-xs font-medium"
              :style="{
                backgroundColor: quick.color,
                color: '#626262'
              }"
              :disabled="isSubmitting"
              @click="handleQuickAmount(quick.amount)"
            >
              +{{ quick.amount.toLocaleString('ko-KR') }}원
            </button>

            <button
              type="button"
              class="py-2 px-4 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500"
              :disabled="isSubmitting"
              @click="handleClearAmount"
            >
              모두 지우기
            </button>
          </div>

          <!-- 아보카도씨 Tip -->
          <div
            ref="tipWrapperRef"
            class="relative mt-3"
          >
            <button
              type="button"
              class="flex items-center gap-2 text-left"
              @click="toggleTip"
            >
              <img
                :src="avocadoSeedImage"
                alt="아보카도 씨"
                class="w-9 h-9 object-contain shrink-0"
              />

              <span
                class="text-xs font-medium text-gray-400 underline underline-offset-2"
              >
                아보카도씨의

                <span class="font-semibold text-[#E5793A]">
                  Tip!
                </span>
              </span>
            </button>

            <!-- Tip 팝오버 -->
            <Transition name="popover">
              <div
                v-if="showTip"
                class="absolute z-50 top-full left-0 mt-2 w-[min(19rem,calc(100vw-3rem))] rounded-2xl bg-white shadow-[0px_8px_24px_0px_rgba(0,0,0,0.15)] p-5 text-left"
              >
                <!-- 닫기 -->
                <button
                  type="button"
                  class="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"
                  aria-label="닫기"
                  @click="showTip = false"
                >
                  <X :size="16" />
                </button>

                <div class="flex items-center gap-2 mb-3">
                  <img
                    :src="avocadoSeedImage"
                    alt=""
                    aria-hidden="true"
                    class="w-7 h-7 object-contain"
                  />

                  <p class="text-sm font-semibold text-gray-500">
                    아보카도씨의

                    <span class="font-bold text-[#E5793A]">
                      Tip!
                    </span>
                  </p>
                </div>

                <p class="text-sm text-gray-500 leading-relaxed pr-5">
                  처음 돈을 넣은 날로부터

                  <span class="font-semibold text-gray-600">
                    최소 7일
                  </span>

                  이 지나야 모은 돈을 돌려받을 수 있어요.
                </p>

                <p class="mt-2 text-sm text-gray-500 leading-relaxed pr-5">
                  저금통을 삭제하면 모은 돈을

                  <span class="font-semibold text-gray-600">
                    바로 다시 돌려받을 수 있어요.
                  </span>
                </p>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- 입력/서버 오류 -->
      <p
        v-if="errorMessage"
        class="mt-3 text-sm text-red-500"
      >
        {{ errorMessage }}
      </p>

      <!--
        키패드가 닫혀 있을 때
        일반 저금통 만들기 버튼
      -->
      <div
        v-if="!showKeypad"
        class="mt-auto pt-4"
      >
        <BaseButton
          variant="primary"
          class="w-full"
          :disabled="!canSubmit"
          @click="openCreateConfirm"
        >
          {{ isSubmitting ? '처리 중...' : '저금통 만들기' }}
        </BaseButton>
      </div>
    </div>

    <BottomNavBar />

    <!--
      공통 숫자 키패드

      overlay:
      기존 내용을 밀지 않고
      화면 아래에서 올라와 덮음
    -->
    <NumberKeypadPanel
      v-model="showKeypad"
      overlay
      mode="amount"
      :disabled="isSubmitting"
      @input="appendDigit"
      @delete="deleteDigit"
    >
      <!-- 키패드 바로 아래 만들기 버튼 -->
      <div class="mt-3 px-4">
        <BaseButton
          variant="primary"
          class="w-full"
          :disabled="!canSubmit"
          @click="openCreateConfirm"
        >
          {{ isSubmitting ? '처리 중...' : '저금통 만들기' }}
        </BaseButton>
      </div>
    </NumberKeypadPanel>

    <!-- 생성 확인 -->
    <ConfirmModal
      v-model="showConfirmModal"
      variant="save"
      title="저금통을 만들까요?"
      confirm-label="만들기"
      :disabled="isSubmitting"
      @confirm="handleSubmit"
    />

    <!-- 생성 성공 -->
    <ResultModal
      v-model="showSuccessModal"
      variant="success"
      title="저금통 생성 완료"
      message="새 저금통을 만들었어요."
      :auto-close-ms="1500"
    />

    <!-- 생성 실패 -->
    <ResultModal
      v-model="showErrorModal"
      variant="error"
      title="저금통 생성 실패"
      :message="modalErrorMessage"
    />
  </div>
</template>

<script setup>
import {
  ref,
  computed
} from 'vue'

import {
  useRouter
} from 'vue-router'

import {
  X
} from 'lucide-vue-next'

import AppHeader from '@/components/common/AppHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ResultModal from '@/components/common/ResultModal.vue'
import NumberKeypadPanel from '@/components/common/NumberKeypadPanel.vue'

import {
  usePiggyBankStore
} from '@/stores/piggyBank'

import avocadoSeedImage from '@/assets/images/cadoseed.png'

const router =
  useRouter()

const store =
  usePiggyBankStore()

const icons = [
  '🚗',
  '🎮',
  '🎂',
  '📚',
  '👕',
  '⚽',
  '⭐',
  '❤️'
]

const name =
  ref('')

const selectedIcon =
  ref('🎮')

const targetAmount =
  ref('')

/**
 * 공통 키패드 표시 여부
 */
const showKeypad =
  ref(false)

const quickAmounts = [
  {
    amount: 1000,
    color: '#FDBEBE'
  },
  {
    amount: 5000,
    color: '#F9D9BB'
  },
  {
    amount: 10000,
    color: '#D4ECC0'
  }
]

const isSubmitting =
  ref(false)

const errorMessage =
  ref('')

const showConfirmModal =
  ref(false)

const showSuccessModal =
  ref(false)

const showErrorModal =
  ref(false)

const modalErrorMessage =
  ref('')

const showTip =
  ref(false)

const tipWrapperRef =
  ref(null)

/**
 * 만들기 가능 여부
 */
const canSubmit =
  computed(
    () =>
      name.value.trim().length > 0 &&
      Number(targetAmount.value) > 0 &&
      !isSubmitting.value
  )

/**
 * 금액 표시
 */
function formatMoney(value) {
  return Number(
    value || 0
  ).toLocaleString(
    'ko-KR'
  )
}

/**
 * 키패드 열기
 */
function openKeypad() {
  errorMessage.value = ''

  /**
   * Tip 팝오버와 동시에 열리지 않게
   */
  showTip.value = false

  showKeypad.value = true
}

/**
 * 빠른 금액 버튼
 *
 * 금액을 더하면서 키패드도 함께 열어줌
 */
function handleQuickAmount(
  amount
) {
  showTip.value = false
  showKeypad.value = true

  addAmount(
    amount
  )
}

/**
 * 모두 지우기
 *
 * 지우면서 키패드도 열어둠
 */
function handleClearAmount() {
  showTip.value = false
  showKeypad.value = true

  clearAmount()
}

/**
 * 아보카도씨 Tip
 */
function toggleTip() {
  /**
   * Tip을 열면 키패드는 닫기
   */
  if (!showTip.value) {
    showKeypad.value = false
  }

  showTip.value =
    !showTip.value
}

/**
 * 키패드 숫자 입력
 */
function appendDigit(
  value
) {
  errorMessage.value = ''

  /**
   * 첫 입력으로 00 방지
   */
  if (
    targetAmount.value === '' &&
    value === '00'
  ) {
    return
  }

  /**
   * 앞자리 0 방지
   */
  if (
    targetAmount.value === '0'
  ) {
    targetAmount.value =
      value === '00'
        ? '0'
        : value

    return
  }

  /**
   * 너무 긴 금액 입력 방지
   */
  const nextValue =
    targetAmount.value +
    value

  if (
    nextValue.length > 9
  ) {
    return
  }

  targetAmount.value =
    nextValue
}

/**
 * 한 자리 삭제
 */
function deleteDigit() {
  errorMessage.value = ''

  targetAmount.value =
    targetAmount.value.slice(
      0,
      -1
    )
}

/**
 * 빠른 금액 추가
 */
function addAmount(
  amount
) {
  errorMessage.value = ''

  targetAmount.value =
    String(
      Number(
        targetAmount.value ||
        0
      ) +
      amount
    )
}

/**
 * 전체 삭제
 */
function clearAmount() {
  errorMessage.value = ''

  targetAmount.value = ''
}

/**
 * 만들기 버튼
 *
 * API 호출 전에 확인창 표시
 */
function openCreateConfirm() {
  if (!canSubmit.value) {
    return
  }

  errorMessage.value = ''

  /**
   * 확인 모달 전에
   * 키패드 / Tip 모두 닫기
   */
  showKeypad.value = false
  showTip.value = false

  showConfirmModal.value =
    true
}

/**
 * 실제 저금통 생성
 */
async function handleSubmit() {
  if (
    !canSubmit.value ||
    isSubmitting.value
  ) {
    return
  }

  isSubmitting.value =
    true

  errorMessage.value =
    ''

  modalErrorMessage.value =
    ''

  try {
    await store.createPiggyBank({
      name:
        name.value.trim(),

      targetAmount:
        Number(
          targetAmount.value
        ),

      icon:
        selectedIcon.value
    })

    showSuccessModal.value =
      true

    /**
     * 성공 모달 표시 후
     * 저금통 목록으로 이동
     */
    setTimeout(() => {
      router.replace({
        name: 'piggy'
      })
    }, 1500)

  } catch (e) {
    modalErrorMessage.value =
      e?.message ||
      '저금통 생성에 실패했어요. 다시 시도해주세요.'

    showErrorModal.value =
      true

  } finally {
    isSubmitting.value =
      false
  }
}
</script>

<style scoped>
.popover-enter-active,
.popover-leave-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s ease;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>