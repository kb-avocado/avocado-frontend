<template>
  <div class="h-screen overflow-hidden flex flex-col bg-surface">
    <AppHeader
      :title="item?.name || '저금통'"
      show-back
      :show-bell="false"
      :show-avatar="false"
      @click-back="router.back()"
    />

    <div v-if="loading" class="flex-1 min-h-0 overflow-y-auto grid place-items-center p-4">
      <p class="text-sm text-muted">불러오는 중...</p>
    </div>

    <div v-else-if="!item" class="flex-1 min-h-0 overflow-y-auto grid place-items-center p-4">
      <p class="text-sm text-muted">저금통 정보를 찾을 수 없어요.</p>
    </div>

    <div v-else class="flex-1 min-h-0 overflow-y-auto p-4 pb-24 space-y-6">
      <!-- 성장 이미지 + 단계 프로그레스바: 한 그룹으로 묶어서 간격을 좁게 -->
      <div class="mx-2 flex flex-col gap-1">
        <!-- 성장 이미지 + 응원보기 -->
        <div class="relative rounded-2xl bg-avocado-50 grid place-items-center min-h-[220px] p-6">
          <!-- 이미지 파일 자체에 여백이 많아서, 고정 박스 + scale로 확대해서 여백을 잘라낸다 -->
          <div class="w-40 h-40 overflow-hidden grid place-items-center grow-idle">
            <Transition name="grow" mode="out-in" appear>
              <img
                :key="stageLevel"
                :src="growthImage"
                alt="저금통 성장"
                class="w-full h-full object-contain scale-125"
              />
            </Transition>
          </div>

          <!-- 단계가 올랐을 경우 효과 -->
          <Transition name="fade">
            <div
              v-if="showLevelUpBadge"
              class="absolute inset-0 pointer-events-none"
              aria-hidden="true"
            >
              <span
                class="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white text-xs font-bold shadow-md whitespace-nowrap level-up-pop"
                style="color: #4c7a3d"
              >
                🌱 쑥쑥 자랐어요!
              </span>
              <span class="sparkle" style="top: 15%; left: 20%; animation-delay: 0s">✨</span>
              <span class="sparkle" style="top: 25%; left: 75%; animation-delay: 0.15s">✨</span>
              <span class="sparkle" style="top: 65%; left: 15%; animation-delay: 0.3s">✨</span>
              <span class="sparkle" style="top: 70%; left: 80%; animation-delay: 0.1s">✨</span>
            </div>
          </Transition>

          <!-- 부모 화면 '응원보내기' 버튼과 동일한 스타일 -->
          <button
            type="button"
            class="absolute bottom-3 right-4 py-[7px] px-[12px] border-0 rounded-full text-xs font-bold whitespace-nowrap"
            style="background-color: #fcf7c2; color: #555353"
            @click="goToCheerMessages"
          >
            보호자 응원보기
          </button>
        </div>

        <PiggyGrowthProgressBar :progress-rate="displayRate" />
      </div>

      <!-- 남은 금액 / 목표 -->
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
        <p class="mx-2 text-sm font-medium text-avocado-900 mb-2">저금한 기록</p>
        <PiggyDepositHistoryList :piggy-bank-id="item.piggyBankId" />
      </div>

      <!-- 안내 문구 + 저금하기 / 삭제하기 -->
      <div class="pt-2">
        <div v-if="!isActive" class="flex items-center justify-center gap-2 mb-3">
          <img :src="cadoseedImage" alt="" aria-hidden="true" class="w-10 h-10 object-contain" />
          <p class="text-center text-xs text-muted">
            저금통 모으기가 완료되어 더이상 저금을 할 수 없어요!
          </p>
        </div>
        <div class="space-y-3">
          <BaseButton v-if="isActive" variant="primary" class="w-full" @click="goToDeposit">
            저금하기
          </BaseButton>

          <!-- 삭제 컴포넌트 -->
          <PiggyDeleteButton :piggy-bank-id="item.piggyBankId" @deleted="onDeleted" />
        </div>
      </div>
    </div>

    <BottomNavBar />
    <!-- 삭제 성공 팝업 -->
    <ResultModal v-model="showDeleted" variant="delete" message="삭제되었어요" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PiggyBank } from 'lucide-vue-next'

import AppHeader from '@/components/common/AppHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import PiggyDepositHistoryList from '@/components/piggy/PiggyDepositHistoryList.vue'
import PiggyGrowthProgressBar from '@/components/piggy/PiggyGrowthProgressBar.vue'
import PiggyDeleteButton from '@/components/piggy/PiggyDeleteButton.vue'
import { usePiggyBankStore } from '@/stores/piggyBank'
import ResultModal from '@/components/common/ResultModal.vue'

import stage1 from '@/assets/images/seed1.png'
import stage2 from '@/assets/images/seed2.png'
import stage3 from '@/assets/images/seed3.png'
import stage4 from '@/assets/images/seed4.png'
import stage5 from '@/assets/images/seed5.png'
import cadoseedImage from '@/assets/images/cadoseed.png'

const LEVEL_UP_BADGE_DURATION_MS = 5000
// 저금통별 마지막으로 확인한 단계를 세션 동안 기억해두는 키.
// '저금하기' 화면으로 이동했다가 돌아오면 이 컴포넌트가 새로 mount되기 때문에,
// 컴포넌트 안의 변수만으로는 "이전 단계"를 알 수 없어 sessionStorage에 저장해둔다.
const STAGE_STORAGE_PREFIX = 'piggyStage:'

function readStoredStage(id) {
  try {
    const raw = sessionStorage.getItem(STAGE_STORAGE_PREFIX + id)
    return raw ? Number(raw) : null
  } catch {
    return null
  }
}

function writeStoredStage(id, stage) {
  try {
    sessionStorage.setItem(STAGE_STORAGE_PREFIX + id, String(stage))
  } catch {
    // 저장 실패해도 화면 동작에는 지장 없음
  }
}

const route = useRoute()
const router = useRouter()
const store = usePiggyBankStore()
const showDeleted = ref(false)

const piggyBankId = computed(() => route.params.id)
const loading = ref(true)

watch(
  piggyBankId,
  async (id) => {
    loading.value = true
    try {
      await store.loadDetail(id)
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

const item = computed(() => store.detail)

const isActive = computed(() => item.value?.status === 'ACTIVE')

const remainingAmount = computed(() => {
  if (item.value?.status === 'ACHIEVE') return 0
  return Math.max(0, Number(item.value?.targetAmount || 0) - Number(item.value?.savedAmount || 0))
})

// 완료(ACHIEVE)된 저금통은 잔액이 환급되어 0이라도 진행률은 100%로 표시
const displayRate = computed(() => {
  if (item.value?.status === 'ACHIEVE') return 100
  return Number(item.value?.progressRate || 0)
})

const stageLevel = computed(() => {
  const rate = displayRate.value
  if (rate < 20) return 1
  if (rate < 40) return 2
  if (rate < 60) return 3
  if (rate < 80) return 4
  return 5
})

const STAGE_IMAGES = [stage1, stage2, stage3, stage4, stage5]
const growthImage = computed(() => STAGE_IMAGES[stageLevel.value - 1])

const showLevelUpBadge = ref(false)
let levelUpTimer = null

// item이 새로 채워질 때마다(첫 로드든, 저금하기 후 다시 돌아온 재조회든) 실행된다.
// sessionStorage에 저장된 이전 단계보다 지금 단계가 높으면 방금 레벨업한 거라 배지를 띄운다.
watch(item, (newItem) => {
  if (!newItem) return

  const id = String(newItem.piggyBankId ?? piggyBankId.value)
  const rate = newItem.status === 'ACHIEVE' ? 100 : Number(newItem.progressRate || 0)
  const newStage = Math.min(5, Math.floor(rate / 20) + 1)
  const storedStage = readStoredStage(id)

  if (storedStage !== null && newStage > storedStage) {
    showLevelUpBadge.value = true

    if (levelUpTimer) clearTimeout(levelUpTimer)
    levelUpTimer = setTimeout(() => {
      showLevelUpBadge.value = false
    }, LEVEL_UP_BADGE_DURATION_MS)
  }

  writeStoredStage(id, newStage)
})

function formatWon(amount) {
  return `${Number(amount || 0).toLocaleString('ko-KR')}원`
}

function goToCheerMessages() {
  router.push({ name: 'piggyCheerMessages', params: { id: item.value.piggyBankId } })
}

function goToDeposit() {
  router.push({ name: 'piggyDeposit', params: { id: piggyBankId.value } })
}

// 삭제 완료 → 팝업 후 목록으로
function onDeleted() {
  showDeleted.value = true
  setTimeout(() => {
    router.replace({ name: 'piggy' })
  }, 1200)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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

.level-up-pop {
  animation: level-up-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes level-up-pop {
  0% {
    transform: translate(-50%, -8px) scale(0.6);
    opacity: 0;
  }

  100% {
    transform: translate(-50%, 0) scale(1);
    opacity: 1;
  }
}

.sparkle {
  position: absolute;
  font-size: 14px;
  animation: sparkle-burst 1s ease-out forwards;
}

@keyframes sparkle-burst {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }

  30% {
    transform: scale(1.2) rotate(90deg);
    opacity: 1;
  }

  100% {
    transform: scale(0.4) rotate(180deg) translateY(-14px);
    opacity: 0;
  }
}
</style>
