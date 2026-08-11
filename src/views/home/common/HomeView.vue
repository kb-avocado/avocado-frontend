<template>
  <div v-if="home" class="p-4 flex flex-col gap-6">
    <!-- 내 지갑 -->
    <section class="rounded-2xl bg-avocado-100 p-5">
      <p class="text-sm text-gray-700">내 지갑</p>

      <div class="flex items-center justify-between mt-1">
        <p class="text-3xl font-bold text-gray-900">
          {{ formatMoney(home.walletBalance) }}
          <span class="text-lg font-medium ml-0.5">원</span>
        </p>

        <RouterLink
          :to="{ name: 'transfer-recipient' }"
          class="flex items-center gap-1 bg-white text-avocado-600 text-sm font-medium px-3 py-2 rounded-full shrink-0"
        >
          <CreditCard :size="14" />
          돈 보내기
        </RouterLink>
      </div>
    </section>

    <!-- 나의 저금통 -->
    <section>
      <div class="flex items-center justify-between mb-3 pl-2">
        <h2 class="text-base font-bold text-gray-900">나의 저금통</h2>

        <RouterLink :to="{ name: 'piggy' }" class="text-sm text-muted"> 모두 보기 </RouterLink>
      </div>

      <!-- 저금통이 없을 때 -->
      <div
        v-if="!home.piggyBanks?.length"
        class="rounded-3xl bg-white shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] p-5"
      >
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
            <Gift :size="22" class="text-avocado-600" />
          </div>

          <p class="text-sm font-medium text-gray-700">지금 저금을 시작해보세요</p>
        </div>

        <RouterLink
          :to="{ name: 'piggy' }"
          class="w-8 h-8 rounded-full bg-avocado-600 flex items-center justify-center shrink-0"
          aria-label="저금통 만들기"
        >
          <Plus :size="16" class="text-white" />
        </RouterLink>
      </div>

      <!-- 저금통이 있을 때 -->
      <div v-else class="flex flex-col gap-3">
        <RouterLink
          v-for="piggy in home.piggyBanks"
          :key="piggy.piggyBankId"
          :to="{
            name: 'piggyChildDetail',
            params: {
              id: piggy.piggyBankId
            }
          }"
          class="rounded-3xl bg-white shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] p-5"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-gray-900">
              {{ piggy.name }}
            </p>

            <p class="text-sm font-medium text-progress-value">{{ getPiggyProgress(piggy) }}%</p>
          </div>

          <div class="h-2 mt-2 overflow-hidden rounded-full bg-progress-track">
            <div
              class="h-full rounded-full bg-progress-value transition-[width] duration-300"
              :style="{
                width: `${getPiggyProgress(piggy)}%`
              }"
            />
          </div>

          <div class="flex justify-between mt-2 text-xs text-muted">
            <span>{{ formatMoney(piggy.balance) }}원</span>
            <span>{{ formatMoney(piggy.targetAmount) }}원</span>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- 리포트 -->
    <section>
      <div class="flex items-center justify-between mb-3 pl-2">
        <h2 class="text-base font-bold text-gray-900">리포트</h2>

        <RouterLink :to="{ name: 'child-report' }" class="text-sm text-muted">
          모두 보기
        </RouterLink>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <RouterLink :to="{ name: 'child-report' }" class="rounded-2xl bg-avocado-100 p-4">
          <span class="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-3">
            <CalendarDays :size="16" class="text-avocado-600" />
          </span>

          <p class="text-sm text-gray-700">오늘 사용</p>

          <p class="text-lg font-bold text-gray-900 mt-1">{{ formatMoney(home.todaySpent) }}원</p>
        </RouterLink>

        <RouterLink :to="{ name: 'child-report' }" class="rounded-2xl bg-avocado-100 p-4">
          <span class="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-3">
            <Wallet :size="16" class="text-avocado-600" />
          </span>

          <p class="text-sm text-gray-700">이번 달 사용</p>

          <p class="text-lg font-bold text-gray-900 mt-1">{{ formatMoney(home.monthSpent) }}원</p>
        </RouterLink>
      </div>
    </section>

    <!-- 경제가 쏙쏙 -->
    <section>
      <div class="flex items-center justify-between mb-3 pl-2">
        <h2 class="text-base font-bold text-gray-900">경제가 쏙쏙</h2>

        <RouterLink :to="{ name: 'newspaper' }" class="text-sm text-muted"> 모두 보기 </RouterLink>
      </div>

      <!-- 뉴스가 없을 때 -->
      <div v-if="!home.news?.length" class="rounded-2xl bg-gray-50 px-4 py-6 text-center">
        <p class="text-sm text-muted">등록된 신문이 없습니다.</p>
      </div>

      <!-- 뉴스가 있을 때 -->
      <div v-else class="flex flex-col gap-3">
        <RouterLink
          v-for="item in home.news"
          :key="item.newsId"
          :to="{
            name: 'newspaper-detail',
            params: {
              newsId: item.newsId
            }
          }"
          class="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4"
        >
          <div class="min-w-0 pr-3">
            <p class="text-sm font-semibold text-gray-900 truncate">
              {{ item.title }}
            </p>

            <p class="text-xs text-muted mt-1">발행일: {{ formatDate(item.publishedAt) }}</p>
          </div>

          <ChevronRight :size="18" class="text-muted shrink-0" />
        </RouterLink>
      </div>
    </section>
  </div>

  <!-- 로딩 -->
  <div v-else-if="isLoading" class="p-4 text-center text-muted text-sm py-10">불러오는 중...</div>

  <!-- 오류 -->
  <div v-else class="p-4 text-center py-10">
    <p class="text-sm text-red-500">홈 정보를 불러오지 못했습니다.</p>

    <button
      type="button"
      class="mt-3 px-4 py-2 rounded-lg bg-avocado-600 text-white text-sm"
      @click="fetchHome"
    >
      다시 불러오기
    </button>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { CreditCard, Gift, Plus, CalendarDays, Wallet, ChevronRight } from 'lucide-vue-next'

// 백엔드 API를 연결할 때 사용
// import { getHome } from '@/api/home'

const home = ref(null)
const isLoading = ref(false)

const MOCK_HOME = {
  walletBalance: 15200,
  todaySpent: 3000,
  monthSpent: 17400,

  piggyBanks: [
    {
      piggyBankId: 1,
      name: '새 자전거 사기',
      balance: 35000,
      targetAmount: 100000
    }
  ],

  news: [
    {
      newsId: 101,
      title: '이 저금통은 어떻게 만들까요?',
      publishedAt: '2026-07-14T09:00:00'
    },
    {
      newsId: 100,
      title: '복리에 대해서 알아봐요',
      publishedAt: '2026-07-14T09:00:00'
    }
  ]
}

async function fetchHome() {
  isLoading.value = true
  home.value = null

  try {
    /*
     * 백엔드 연결 시 아래 코드 사용
     *
     * const { data } = await getHome()
     * home.value = data
     */

    // 현재는 mock 데이터 사용
    home.value = MOCK_HOME
  } catch (error) {
    console.error('홈 정보 조회 실패:', error)
    home.value = null
  } finally {
    isLoading.value = false
  }
}

function formatMoney(value) {
  return Number(value ?? 0).toLocaleString('ko-KR')
}

function formatDate(dateString) {
  if (!dateString) {
    return ''
  }

  return dateString.slice(0, 10)
}

function getPiggyProgress(piggy) {
  const balance = Number(piggy?.balance ?? 0)
  const targetAmount = Number(piggy?.targetAmount ?? 0)

  if (targetAmount <= 0) {
    return 0
  }

  const progress = Math.round((balance / targetAmount) * 100)

  return Math.min(100, Math.max(0, progress))
}

onMounted(fetchHome)
</script>
