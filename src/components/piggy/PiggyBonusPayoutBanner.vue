<template>
    <div v-if="hasBonus" class="space-y-2">
        <p class="text-xs text-muted text-center">
            {{
                isPaid
                    ? '보너스를 지급 완료 했어요!'
                    : isAchieved
                        ? '보너스를 아직 지급하지 않았어요!'
                        : `목표 달성 시 ${bonusAmount.toLocaleString('ko-KR')}원이 지급돼요`
            }}
        </p>
        <BaseButton variant="primary" class="w-full gap-2" :disabled="!canPay" @click="goToPayment">
            <PiggyBank :size="18" />
            <span>{{ isPaid ? '지급 완료' : '보너스 지급하기' }}</span>
        </BaseButton>
    </div>
</template>


<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { PiggyBank } from 'lucide-vue-next'

import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
    // 저금통의 아이디
    piggyBankId: {
        type: [String, Number],
        required: true
    },
    // 저금통의 상태
    status: {
        type: String,
        required: true
    },
    // NONE, RATE, FIXED
    bonusType: {
        type: String,
        default: 'NONE'
    },
    // 정액 금액 또는 비율
    bonusValue: {
        type: Number,
        default: 0
    },
    // 지급된 적 있으면 날짜 문자열, 없으면 null
    bonusPaidAt: {
        type: String,
        default: null
    },
    // RATE 타입일 경우 계산
    targetAmount: {
        type: Number,
        default: 0
    }
})

const router = useRouter()

/* 보너스가 설정돼있는지 */
const hasBonus = computed(() => props.bonusType && props.bonusType !== 'NONE')

/* 목표 최종 달성(7일 경과 확정) 상태인지 확인 */
const isAchieved = computed(() => props.status === 'ACHIEVE')

/* 보너스가 이미 지급됐는지 확인 */
const isPaid = computed(() => !!props.bonusPaidAt)

/* 만기달성 + 보너스 설정 + 아직 미지급이어야 지급 가능 */
const canPay = computed(() => isAchieved.value && hasBonus.value && !isPaid.value)

/* 보너스가 RATE 타입일 경우 계산 */
const bonusAmount = computed(() => {
    if (!hasBonus.value) return 0
    if (props.bonusType === 'RATE') {
        return Math.floor((props.targetAmount * props.bonusValue) / 100)
    }
    return props.bonusValue ?? 0
})

/* 보너스 송금 버튼 클릭시 축하 및 보너스 송금 화면으로 이동 */
function goToPayment() {
    if (!canPay.value) return
    router.push({ name: 'piggyGoalComplete', params: { id: props.piggyBankId } })
}
</script>