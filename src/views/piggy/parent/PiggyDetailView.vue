<template>
  <div class="h-screen overflow-hidden flex flex-col bg-surface">
    <AppHeader
      :title="item?.name || '저금통'"
      show-back
      :show-bell="false"
      :show-avatar="false"
      @click-back="router.back()"
    />

    <div v-if="!item" class="flex-1 min-h-0 overflow-y-auto grid place-items-center p-4">
      <p class="text-sm text-muted">저금통 정보를 찾을 수 없어요.</p>
    </div>

    <div v-else class="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
      <!-- 저금통 성장 이미지 + 단계 프로그레스바: 한 그룹으로 묶어서 간격을 좁게 -->
      <div class="mx-2 flex flex-col gap-1">
        <div class="relative rounded-2xl bg-avocado-50 grid place-items-center min-h-[220px] p-6">
          <!-- 이미지 파일 자체에 여백이 많아서, 고정 박스 + scale로 확대해서 여백을 잘라낸다 -->
          <div class="w-40 h-40 overflow-hidden grid place-items-center grow-idle">
            <Transition name="grow" mode="out-in" appear>
              <img
                :key="growthImage"
                :src="growthImage"
                alt="저금통 성장"
                class="w-full h-full object-contain scale-125"
              />
            </Transition>
          </div>

          <!-- 부모 화면 '응원보내기' 버튼과 동일한 스타일 -->
          <button
            type="button"
            class="absolute bottom-3 right-4 py-[7px] px-[12px] border-0 rounded-full text-xs font-bold whitespace-nowrap"
            style="background-color: #fcf7c2; color: #555353"
            @click="goToCheerMessages"
          >
            보냈던 응원보기
          </button>
        </div>

        <PiggyGrowthProgressBar :progress-rate="displayRate" />
      </div>

      <!-- 남은 금액 / 목표 금액 -->
      <div class="mx-2 flex items-center justify-between rounded-2xl bg-avocado-100 p-4">
        <div>
          <p class="text-[11px] text-muted">남은 금액</p>
          <p class="text-lg font-bold text-avocado-900">{{ formatWon(remainingAmount) }}</p>
        </div>
        <div class="text-right">
          <p class="text-[11px] text-muted">목표</p>
          <p class="text-lg font-bold text-avocado-900">{{ formatWon(item.targetAmount) }}</p>
        </div>
      </div>
      <!-- 입금 내역 -->
      <div>
        <p class="mx-2 text-sm font-medium text-avocado-900 mb-2">입금 내역</p>
        <PiggyDepositHistoryList :piggy-bank-id="item.piggyBankId" :child-id="childId" />
      </div>

      <!-- 보너스 지급 배너 (팀원 컴포넌트) -->
      <PiggyBonusPayoutBanner
        :piggy-bank-id="item.piggyBankId"
        :status="item.status"
        :bonus-type="item.bonusType"
        :bonus-value="item.bonusValue"
        :bonus-paid-at="item.bonusPaidAt"
        :target-amount="item.targetAmount"
        :child-id="childId"
      />
    </div>

    <BottomNavBar />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/common/AppHeader.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import PiggyBonusPayoutBanner from '@/components/piggy/PiggyBonusPayoutBanner.vue'
import PiggyDepositHistoryList from '@/components/piggy/PiggyDepositHistoryList.vue'

import { usePiggyBankStore } from '@/stores/piggyBank'

import PiggyGrowthProgressBar from '@/components/piggy/PiggyGrowthProgressBar.vue'

// 성장 단계 이미지 (5단계)
import stage1 from '@/assets/images/seed1.png'
import stage2 from '@/assets/images/seed2.png'
import stage3 from '@/assets/images/seed3.png'
import stage4 from '@/assets/images/seed4.png'
import stage5 from '@/assets/images/seed5.png'

const route = useRoute()
const router = useRouter()
const store = usePiggyBankStore()

const piggyBankId = computed(() => route.params.id)
const childId = computed(() => route.params.childId)

watch(
  piggyBankId,
  (id) => {
    store.loadDetail(id, childId.value)
  },
  { immediate: true }
)

const item = computed(() => store.detail)

// 완료(ACHIEVE)된 저금통은 잔액이 환급되어 0이라도 진행률은 100%로 표시
const displayRate = computed(() => {
  if (item.value?.status === 'ACHIEVE') return 100
  return Number(item.value?.progressRate || 0)
})

const remainingAmount = computed(() => {
  if (item.value?.status === 'ACHIEVE') return 0
  return Math.max(0, Number(item.value?.targetAmount || 0) - Number(item.value?.savedAmount || 0))
})

const growthImage = computed(() => {
  const rate = displayRate.value
  if (rate < 20) return stage1
  if (rate < 40) return stage2
  if (rate < 60) return stage3
  if (rate < 80) return stage4
  return stage5
})

function formatWon(amount) {
  return `${Number(amount || 0).toLocaleString('ko-KR')}원`
}

function goToCheerMessages() {
  router.push({
    name: 'piggyCheerMessagesManage',
    params: { childId: childId.value, id: item.value.piggyBankId }
  })
}
</script>

<style scoped>
.grow-idle {
  animation: grow-sway 3.5s ease-in-out infinite;
}

@keyframes grow-sway {
  0%,
  100% {
    transform: rotate(-2deg);
  }

  50% {
    transform: rotate(2deg);
  }
}

.grow-enter-active {
  transition:
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.35s ease;
}

.grow-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.grow-enter-from {
  transform: scale(0.6);
  opacity: 0;
}

.grow-leave-to {
  transform: scale(0.85);
  opacity: 0;
}
</style>
