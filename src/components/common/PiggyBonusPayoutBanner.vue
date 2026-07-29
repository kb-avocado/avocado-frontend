<template>
    <div v-if="bonus" class="space-y-2">
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

    // 저금통에 걸린 보너스
    bonus: {
        type: Object,
        default: null
    },

    // RATE 타입일 경우 계산
    targetAmount: {
        type: Number,
        default: 0
    }
})

const router = useRouter()

/* ACHIEVED 즉 만기달성 상태인지 확인 */
const isAchieved = computed(() => props.status === 'ACHIEVED')

/* 보너스가 지급된 상태인지 확인 */
const isPaid = computed(() => props.bonus?.status === 'PAID')

/* 만기달성 + 보너스 설정 + 보너스 지급 조건이 모두 참이여야함 */
const canPay = computed(() => isAchieved.value && props.bonus && !isPaid.value)

/* 보너스가 RATE 타입일 경우 계산 */
const bonusAmount = computed(() => {
    if (!props.bonus) return 0
    if (props.bonus.type === 'RATE') {
        return Math.floor((props.targetAmount * props.bonus.rate) / 100)
    }
    return props.bonus.amount ?? 0
})

/* 보너스 송금 버튼 클릭시 축하 및 보너스 송금 화면으로 이동 */
function goToPayment() {
    if (!canPay.value) return
    router.push({ name: 'piggyGoalComplete', params: { id: props.piggyBankId } })
}
</script>