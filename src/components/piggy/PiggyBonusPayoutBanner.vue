<template>
  <!-- 보너스가 이미 설정된 저금통 -->
  <div v-if="hasBonus" class="space-y-3">
    <!-- 보너스 지급 완료 -->
    <div v-if="isPaid" class="flex items-center gap-2">
      <img
        :src="avocadoSeedImage"
        alt=""
        aria-hidden="true"
        class="w-9 h-9 object-contain shrink-0"
      />

      <p class="text-xs text-gray-400 leading-relaxed">보너스를 지급 완료했어요!</p>
    </div>

    <!-- 보너스 지급 대기중 -->
    <div v-else-if="isAchieved" class="flex items-center gap-2">
      <img
        :src="avocadoSeedImage"
        alt=""
        aria-hidden="true"
        class="w-9 h-9 object-contain shrink-0"
      />

      <p class="text-xs text-gray-400 leading-relaxed">보너스를 아직 지급하지 않았어요!</p>
    </div>

    <!-- 진행중 저금통 -->
    <div v-else class="flex items-center gap-2">
      <img
        :src="avocadoSeedImage"
        alt=""
        aria-hidden="true"
        class="w-9 h-9 object-contain shrink-0"
      />

      <p class="text-xs text-gray-400 leading-relaxed">
        목표 달성 시
        <span class="font-bold text-gray-500"> {{ bonusAmount.toLocaleString('ko-KR') }}원 </span>
        이 지급돼요
      </p>
    </div>

    <!--
      보너스 지급 버튼

      진행중 저금통에서는 아예 보여주지 않는다.
      - ACHIEVE → 보너스 지급하기
      - 지급 완료 → 지급 완료
    -->
    <BaseButton
      v-if="isAchieved || isPaid"
      variant="primary"
      class="w-full gap-2"
      :disabled="!canPay"
      @click="goToPayment"
    >
      <PiggyBank :size="18" />

      <span>
        {{ isPaid ? '지급 완료' : '보너스 지급하기' }}
      </span>
    </BaseButton>
  </div>

  <!-- 아직 보너스를 설정하지 않은 저금통 -->
  <div v-else class="space-y-3">
    <!-- 보너스 설정 안내 -->
    <div class="flex items-center gap-2">
      <img
        :src="avocadoSeedImage"
        alt=""
        aria-hidden="true"
        class="w-9 h-9 object-contain shrink-0"
      />

      <p v-if="isAchieved" class="text-xs text-gray-400 leading-relaxed">
        이미 완료된 저금통이라 보너스를 설정할 수 없어요!
      </p>

      <p v-else class="text-xs text-gray-400 leading-relaxed">
        아이의 목표 달성을 응원하는 보너스를 설정해주세요!
        <br />
        보너스와 함께 아이의 즐거운 저축 습관을 응원해 보세요.
      </p>
    </div>

    <!-- 보너스 설정 -->
    <div class="px-4 pb-4">
      <BaseButton variant="primary" class="w-full gap-2" :disabled="isAchieved" @click="goToSetup">
        <span> 보너스 설정하기 </span>
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import { useRouter } from 'vue-router'

import { PiggyBank } from 'lucide-vue-next'

import BaseButton from '@/components/common/BaseButton.vue'

import avocadoSeedImage from '@/assets/images/cadoseed.png'

const props = defineProps({
  /**
   * 저금통 ID
   */
  piggyBankId: {
    type: [String, Number],
    required: true
  },

  /**
   * 저금통 상태
   */
  status: {
    type: String,
    required: true
  },

  /**
   * NONE / RATE / FIXED
   */
  bonusType: {
    type: String,
    default: 'NONE'
  },

  /**
   * 정액 금액 또는 비율
   */
  bonusValue: {
    type: Number,
    default: 0
  },

  /**
   * 지급된 적이 있으면 날짜
   * 미지급이면 null
   */
  bonusPaidAt: {
    type: String,
    default: null
  },

  /**
   * RATE 타입 계산용 목표 금액
   */
  targetAmount: {
    type: Number,
    default: 0
  },

  /**
   * 아이 ID
   */
  childId: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()

/**
 * 보너스 설정 여부
 */
const hasBonus = computed(() => props.bonusType && props.bonusType !== 'NONE')

/**
 * 보너스 지급 대기 상태
 *
 * 목표 달성 + 7일 조건까지 충족하여
 * 보너스 지급이 가능한 상태
 */
const isAchieved = computed(() => props.status === 'ACHIEVE')

/**
 * 이미 지급 완료됐는지
 */
const isPaid = computed(() => Boolean(props.bonusPaidAt))

/**
 * 실제 보너스 지급 가능 여부
 *
 * - ACHIEVE 상태
 * - 보너스 설정됨
 * - 아직 지급되지 않음
 */
const canPay = computed(() => isAchieved.value && hasBonus.value && !isPaid.value)

/**
 * 실제 지급될 보너스 금액
 *
 * RATE
 * → 목표 금액 × 비율
 *
 * FIXED
 * → 설정한 금액 그대로
 */
const bonusAmount = computed(() => {
  if (!hasBonus.value) {
    return 0
  }

  if (props.bonusType === 'RATE') {
    return Math.floor((props.targetAmount * props.bonusValue) / 100)
  }

  return props.bonusValue ?? 0
})

/**
 * 보너스 지급 화면 이동
 *
 * 진행중에서는 버튼 자체가 없기 때문에
 * ACHIEVE 상태에서만 실행된다.
 */
function goToPayment() {
  if (!canPay.value) {
    return
  }

  router.push({
    name: 'piggyGoalComplete',

    params: {
      childId: props.childId,

      id: props.piggyBankId
    }
  })
}

/**
 * 보너스 설정 화면 이동
 */
function goToSetup() {
  router.push({
    name: 'piggyBonus',

    params: {
      childId: props.childId,

      id: props.piggyBankId
    }
  })
}
</script>
