<template>

  <div v-if="home" class="p-4 flex flex-col gap-6">

<!-- 내 지갑 -->

    <section

v-if="!hasRequestedWallet || walletLoading"

class="animate-pulse rounded-2xl bg-avocado-100 p-5"

role="status"

aria-label="선불 지갑 잔액을 불러오는 중"

    >

      <div class="h-5 w-16 rounded bg-avocado-300" />

      <div class="mt-3 h-9 w-36 rounded bg-avocado-300" />

    </section>

    <section

v-else-if="walletStatusError || !wallet"

class="rounded-2xl bg-gray-50 p-5"

      :role="walletStatusError ? 'alert' : 'status'"

    >

      <p class="text-sm font-semibold text-gray-900">

        {{ walletStatusError ? '지갑 잔액을 불러오지 못했어요' : '등록된 선불 지갑이 없어요' }}

      </p>

      <p class="mt-1 text-xs text-gray-500">

        {{ walletStatusError || '선불 지갑을 등록하면 홈에서 잔액을 확인할 수 있어요.' }}

      </p>

      <button

v-if="walletError && !walletAccessError"

type="button"

class="mt-3 rounded-full bg-avocado-600 px-4 py-2 text-sm font-medium text-white"

        @click="fetchWalletBalance"

      >

        다시 시도

      </button>

    </section>

<!-- 지갑 카드: 피그마 스펙(padding 32/24/28/24, gap 20, radius 24) 반영 -->

    <section

v-else

class="relative flex flex-col items-center text-center overflow-visible"

style="

        padding: 26px 24px 22px 24px;

        gap: 18px;

        border-radius: 24px;

        background-color: #ebf4dd;

        box-shadow: 0 4px 12px 0 rgba(54, 106, 27, 0.12);

      "

    >

<!-- 박음질(스티치) 테두리 -->

      <svg

class="absolute inset-0 w-full h-full pointer-events-none"

preserveAspectRatio="none"

aria-hidden="true"

      >

        <rect

x="8"

y="8"

width="calc(100% - 16px)"

height="calc(100% - 16px)"

rx="18"

fill="none"

stroke="#B9D69A"

stroke-width="1.5"

stroke-dasharray="14 8"

        />

      </svg>

<!-- 지갑 잠금 탭(똑딱이): 카드 오른쪽 옆면에 붙임 -->

      <div

class="absolute top-1/2 -right-[14px] -translate-y-1/2 w-7 h-16 rounded-full flex items-center justify-center"

style="background-color: #cfe4b3; box-shadow: 0 2px 4px rgba(54, 106, 27, 0.18)"

aria-hidden="true"

      >

        <span class="w-3.5 h-3.5 rounded-full" style="background-color: #f0c948" />

      </div>

      <img

        :src="walletTypeImage"

alt="저번달 소비 유형 캐릭터"

class="relative w-36 h-36 object-contain mt-2"

      />

      <div>

        <p class="text-lg font-bold text-gray-900">내 아보카도 지갑</p>

        <p class="text-xs text-gray-400 mt-1">{{ wallet.walletNumber }}</p>

      </div>

      <p class="text-3xl font-bold text-gray-900">

        {{ formatMoney(walletBalance) }}

        <span class="text-lg font-medium ml-0.5">원</span>

      </p>

      <div class="flex items-center gap-3 w-full">

        <RouterLink

          :to="{ name: 'transfer-recipient' }"

class="flex-1 text-center bg-white text-sm font-medium py-3 rounded-full"

style="color: #366a1b"

        >

          송금

        </RouterLink>

        <RouterLink

          :to="{ name: 'wallet' }"

class="flex-1 text-center bg-avocado-600 text-white text-sm font-medium py-3 rounded-full"

        >

          결제

        </RouterLink>

      </div>

      <p v-if="walletBalance === 0" class="text-xs text-gray-600">

        현재 사용할 수 있는 잔액이 없어요.

      </p>

    </section>

<!-- 나의 저금통 -->

    <section>

      <div class="flex items-center justify-between mb-3 pl-2">

        <h2 class="text-base font-bold text-gray-900">나의 저금통</h2>

        <RouterLink :to="{ name: 'piggy' }" class="text-sm text-muted"> 모두 보기 </RouterLink>

      </div>

<!-- 저금통이 없을 때 -->

      <RouterLink

v-if="!home.piggyBanks?.length"

        :to="{ name: 'piggy' }"

class="flex items-center justify-between rounded-full bg-white shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] px-6 py-5"

aria-label="저금통 만들기"

      >

        <p class="text-sm font-medium text-gray-500">

          {{ home.hasPiggyBanks ? '즐겨찾는 저금통을 등록하세요' : '저금통이 없습니다' }}

        </p>

        <span

class="w-12 h-12 rounded-full flex items-center justify-center shrink-0"

style="background-color: #ffdf77"

        >

          <Plus :size="20" class="text-gray-700" />

        </span>

      </RouterLink>

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

          <div class="flex items-center gap-3">

            <span

class="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"

style="background-color: #f3f3f3"

aria-hidden="true"

            >

              {{ getPiggyIcon(piggy) }}

            </span>

            <div class="flex-1 min-w-0">

              <div class="flex items-center justify-between">

                <p class="text-sm font-semibold text-gray-900 truncate">

                  {{ piggy.name }}

                </p>

                <p class="text-sm font-medium shrink-0" style="color: #949494">

                  {{ getPiggyProgress(piggy) }}%

                </p>

              </div>

<!-- 프로그레스바: 채움 #FFDF77 / 배경 #EBEBEB -->

              <div class="h-3 mt-2 overflow-hidden rounded-full" style="background-color: #ebebeb">

                <div

class="h-full rounded-full transition-[width] duration-700 ease-out"

                  :style="{

                    backgroundColor: '#ffdf77',

                    width: piggyBarsRevealed ? `${getPiggyProgress(piggy)}%` : '0%'

                  }"

                />

              </div>

              <div class="flex justify-between mt-2 text-xs text-muted">

                <span>{{ formatMoney(piggy.balance) }}원</span>

                <span>{{ formatMoney(piggy.targetAmount) }}원</span>

              </div>

            </div>

          </div>

        </RouterLink>

      </div>

    </section>

<!-- 소비 / 신문 토글 -->

    <section>

      <div class="flex items-center justify-between mb-3">

        <div class="flex items-center gap-2">

          <button

v-for="tabOption in HOME_TAB_OPTIONS"

            :key="tabOption.key"

type="button"

class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"

            :style="

              activeHomeTab === tabOption.key

                ? {

                    backgroundColor: '#4C4C4C',

                    border: '1.5px solid #5F5F5F',

                    color: '#FFFFFF'

                  }

                : {

                    backgroundColor: '#FFFFFF',

                    border: '1.5px solid #D1D5DB',

                    color: '#72796B'

                  }

            "

            @click="activeHomeTab = tabOption.key"

          >

            {{ tabOption.label }}

          </button>

        </div>

        <RouterLink :to="homeTabMoreLink" class="text-sm text-muted"> 모두 보기 </RouterLink>

      </div>

<!-- 소비 탭 -->

      <div v-if="activeHomeTab === 'SPENDING'" class="grid grid-cols-2 gap-3">

        <RouterLink

          :to="{ name: 'child-report' }"

class="rounded-2xl p-4"

style="background-color: #f5faff"

        >

          <span class="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-3">

            <Wallet :size="16" style="color: #5284a5" />

          </span>

          <p class="text-sm text-gray-700">이번달 사용</p>

          <p class="text-lg font-bold text-gray-900 mt-1">{{ formatMoney(home.monthSpent) }}원</p>

        </RouterLink>

        <RouterLink

          :to="{ name: 'child-report' }"

class="rounded-2xl p-4"

style="background-color: #fff8f5"

        >

          <span class="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-3">

            <CalendarDays :size="16" style="color: #ff8c69" />

          </span>

          <p class="text-sm text-gray-700">오늘 사용</p>

          <p class="text-lg font-bold text-gray-900 mt-1">{{ formatMoney(home.todaySpent) }}원</p>

        </RouterLink>

      </div>

<!-- 신문 탭 -->

      <div v-else class="flex flex-col gap-3">

<!-- 뉴스가 없을 때 -->

        <div v-if="!home.news?.length" class="rounded-2xl bg-gray-50 px-4 py-6 text-center">

          <p class="text-sm text-muted">등록된 신문이 없습니다.</p>

        </div>

<!-- 뉴스가 있을 때 -->

        <RouterLink

v-else

v-for="item in home.news"

          :key="item.newsId"

          :to="{

            name: 'newspaper-detail',

            params: {

              newsId: item.newsId

            }

          }"

class="relative flex items-center justify-between h-20 pl-5 pr-4 rounded-2xl overflow-visible"

          :class="item.isNew ? '' : 'bg-[#f6f6f6] shadow-[0px_2px_6px_0px_rgba(191,191,191,0.4)]'"

          :style="item.isNew ? { backgroundColor: '#EBF4DD' } : undefined"

        >

<!-- 티켓 탭 -->

          <span

class="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full"

style="background-color: #bfbfbf"

          />

          <div class="min-w-0 flex-1 pr-3" :class="item.isRead ? 'opacity-70' : ''">

            <div class="flex items-center gap-2">

              <p

class="truncate"

                :class="item.isRead ? 'text-gray-500 font-medium' : 'text-gray-900 font-bold'"

              >

                {{ item.title }}

              </p>

              <span

v-if="item.isNew"

class="text-[10px] font-bold text-white rounded-full px-2 py-0.5 shrink-0"

style="

                  background-color: #c97474;

                  box-shadow: inset 0 -1px 2px 0 rgba(255, 255, 255, 0.45);

                "

              >

                NEW

              </span>

            </div>

            <p class="text-xs text-muted mt-1">발행일: {{ formatDate(item.publishedAt) }}</p>

          </div>

          <img

v-if="item.isCompleted"

            :src="getBadgeImage(item.newsId)"

alt="참 잘했어요"

class="w-11 h-11 rounded-full bg-white object-contain shrink-0"

          />

          <ChevronRight v-else :size="18" style="color: #bfbfbf" class="shrink-0" />

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

import { computed, nextTick, onMounted, ref } from 'vue'

import { storeToRefs } from 'pinia'

import { CalendarDays, Plus, Wallet, ChevronRight } from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'

import { useWalletStore } from '@/stores/wallet'

import { getSpendingType } from '@/api/report'

import { getHome } from '@/api/home'

import { getSpendingTypeImage, DEFAULT_SPENDING_TYPE_IMAGE } from '@/constants/spendingTypeImages'

import ch11 from '@/assets/images/ch11.png'

import ch12 from '@/assets/images/ch12.png'

const home = ref(null)

// 저금통 진행바를 0% → 실제 진행률로 슈욱 차오르게 하는 연출용 플래그

const piggyBarsRevealed = ref(false)

const isLoading = ref(false)

const authStore = useAuthStore()

const walletStore = useWalletStore()

const { wallet, loading: walletLoading, error: walletError } = storeToRefs(walletStore)

const hasRequestedWallet = ref(false)

const walletAccessError = ref('')

const walletTypeImage = ref(DEFAULT_SPENDING_TYPE_IMAGE)

// 소비/신문 토글: 기존 "리포트"/"경제가 쏙쏙" 두 섹션을 하나로 합침

const HOME_TAB_OPTIONS = [

{ key: 'SPENDING', label: '소비' },

{ key: 'NEWS', label: '신문' }

]

const activeHomeTab = ref('SPENDING')

const homeTabMoreLink = computed(() =>

activeHomeTab.value === 'SPENDING' ? { name: 'child-report' } : { name: 'newspaper' }

)

const childId = computed(

() =>

authStore.user?.childId ??

authStore.user?.child_id ??

authStore.user?.userId ??

authStore.user?.user_id ??

authStore.user?.id ??

''

)

const walletBalance = computed(() => Number(wallet.value?.balance ?? 0))

const walletStatusError = computed(() => walletAccessError.value || walletError.value)

function getLastMonth() {

  const now = new Date()

  const date = new Date(now.getFullYear(), now.getMonth() - 1, 1)

return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

}

async function fetchHome() {

isLoading.value = true

home.value = null

piggyBarsRevealed.value = false

try {

    const { data } = await getHome()

home.value = {

      todaySpent: data.data.todaySpent,

      monthSpent: data.data.monthSpent,

      piggyBanks: data.data.favoritePiggyBanks,

      hasPiggyBanks: data.data.hasPiggyBanks,

      news: data.data.news

    }

await nextTick()

requestAnimationFrame(() => {

piggyBarsRevealed.value = true

    })

  } catch (error) {

console.error('홈 정보 조회 실패:', error)

home.value = null

  } finally {

isLoading.value = false

  }

}

async function fetchWalletBalance() {

  if (walletLoading.value) return

hasRequestedWallet.value = true

walletAccessError.value = ''

  if (!authStore.user || !childId.value) {

walletStore.reset()

walletAccessError.value = '로그인 사용자 정보를 확인할 수 없어요. 다시 로그인해 주세요.'

return

  }

try {

await walletStore.fetchWallet(childId.value)

  } catch {

// 지갑 조회 오류 상태는 wallet store에서 관리합니다.

  }

}

async function fetchWalletTypeImage() {

  if (!childId.value) return

try {

    const { data } = await getSpendingType(getLastMonth(), childId.value)

walletTypeImage.value = getSpendingTypeImage(data.data?.code)

  } catch (error) {

console.error('저번달 소비 유형 조회 실패:', error)

walletTypeImage.value = DEFAULT_SPENDING_TYPE_IMAGE

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

// 완료한 신문 뱃지 이미지: newsId마다 매번 다르게 안 바뀌도록 한 번 고른 걸 캐싱 (신문 탭과 동일 방식)

const BADGE_IMAGES = [ch11, ch12]

const badgeImageMap = new Map()

function getBadgeImage(newsId) {

  if (!badgeImageMap.has(newsId)) {

    const randomImage = BADGE_IMAGES[Math.floor(Math.random() * BADGE_IMAGES.length)]

badgeImageMap.set(newsId, randomImage)

  }

return badgeImageMap.get(newsId)

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

function getPiggyIcon(piggy) {

  if (piggy?.icon) return piggy.icon

  const text = `${piggy?.name ?? ''} ${piggy?.description ?? ''}`

  if (text.includes('자전거')) return '🚲'

  if (text.includes('책')) return '📚'

  if (text.includes('게임')) return '🎮'

  if (text.includes('여행')) return '🌍'

  if (text.includes('선물')) return '🎁'

return '🚀'

}

onMounted(() => {

fetchHome()

fetchWalletBalance()

fetchWalletTypeImage()

})

</script>