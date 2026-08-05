<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppHeader
      :title="item?.name || '저금통'"
      show-back
      :show-bell="false"
      :show-avatar="false"
      @click-back="router.back()"
    />

    <div v-if="!item" class="flex-1 grid place-items-center p-4">
      <p class="text-sm text-muted">저금통 정보를 찾을 수 없어요.</p>
    </div>

    <div v-else class="flex-1 p-4 space-y-6">
      <!-- 저금통 성장 이미지 + 응원보기 -->
      <div class="relative rounded-2xl bg-avocado-50 grid place-items-center min-h-[180px] p-6">
        <img :src="growthImage" alt="저금통 성장" class="max-h-40 object-contain" />
        <button
          type="button"
          class="absolute bottom-3 right-3 bg-avocado-100 text-avocado-600 text-xs font-semibold rounded-full px-3 py-1"
          @click="goToCheerMessages"
        >
          보호자님 응원보기
        </button>
      </div>
      <!-- 추가: 성장 단계 진행률바 -->
      <PiggyGrowthProgressBar :progress-rate="item.progressRate" />

      <!-- 남은 금액 / 목표 금액 -->
      <div class="flex items-center justify-between rounded-2xl bg-avocado-100 p-4">
        <div>
          <p class="text-xs text-muted">남은 금액</p>
          <p class="text-xl font-bold text-avocado-900">{{ formatWon(remainingAmount) }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-muted">목표</p>
          <p class="text-xl font-bold text-avocado-900">{{ formatWon(item.targetAmount) }}</p>
        </div>
      </div>
      <!-- 입금 내역 -->
      <div>
        <p class="text-sm font-medium text-avocado-900 mb-2">입금 내역</p>
        <PiggyDepositHistoryList :piggy-bank-id="item.piggyBankId" />
      </div>
      <!-- 보너스 지급 배너 (팀원 컴포넌트) -->
      <PiggyBonusPayoutBanner
        :piggy-bank-id="item.piggyBankId"
        :status="item.status"
        :bonus="item.bonus"
        :target-amount="item.targetAmount"
      />
    </div>

    <BottomNavBar />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue' // 상세조회 추가: onMounted
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/common/AppHeader.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import PiggyBonusPayoutBanner from '@/components/piggy/PiggyBonusPayoutBanner.vue'
import PiggyDepositHistoryList from '@/components/piggy/PiggyDepositHistoryList.vue'

import { usePiggyBankStore } from '@/stores/piggyBank'

import PiggyGrowthProgressBar from '@/components/piggy/PiggyGrowthProgressBar.vue'

// 성장 단계 이미지 (5단계)
import stage1 from '@/assets/images/ch6.png'
import stage2 from '@/assets/images/ch7.png'
import stage3 from '@/assets/images/ch8.png'
import stage4 from '@/assets/images/ch9.png'
import stage5 from '@/assets/images/ch10.png'

const route = useRoute()
const router = useRouter()
const store = usePiggyBankStore()

const piggyBankId = computed(() => route.params.id)

// 상세조회 변경: 스토어를 뒤지지 않고, 백엔드 상세 API로 조회
onMounted(() => {
  store.loadDetail(piggyBankId.value)
})

// 상세조회 변경: 백엔드 상세 결과 사용
const item = computed(() => store.detail)

const remainingAmount = computed(() =>
  Math.max(0, Number(item.value?.targetAmount || 0) - Number(item.value?.savedAmount || 0))
)

const growthImage = computed(() => {
  const rate = Number(item.value?.progressRate || 0)
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
  router.push({ name: 'piggyCheerMessages', params: { id: item.value.piggyBankId } })
}
</script>
