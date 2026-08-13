<template>
  <div class="p-4 flex flex-col gap-6">
    <!-- 아이 전환 -->
    <div class="flex gap-4 px-1">
      <button
        v-for="child in children"
        :key="child.id"
        type="button"
        class="flex flex-col items-center gap-1"
        @click="onSelectChild(child.id)"
      >
        <span
          class="w-14 h-14 rounded-full bg-avocado-50 flex items-center justify-center overflow-hidden"
          :class="String(child.id) === String(childId) ? 'ring-2 ring-avocado-600' : ''"
        >
          <img :src="childAvatarImage(child.id)" alt="" class="w-10 h-10 object-contain" />
        </span>
        <span
          class="text-sm"
          :class="
            String(child.id) === String(childId) ? 'font-semibold text-avocado-600' : 'text-muted'
          "
        >
          {{ child.name }}
        </span>
      </button>
    </div>

    <div v-if="home">
      <!-- 아이 지갑 -->
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
          {{ walletStatusError || '아이의 선불 지갑이 등록되면 홈에서 잔액을 확인할 수 있어요.' }}
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

      <section v-else class="rounded-2xl bg-avocado-100 p-5">
        <div class="flex items-center justify-between">
          <p class="text-lg font-bold text-gray-900">{{ selectedChildName }}의 아보카도 지갑</p>

          <RouterLink
            :to="{ name: 'wallet', query: { mode: 'transfer', childId } }"
            class="flex items-center gap-1 bg-white text-avocado-600 text-sm font-medium px-3 py-2 rounded-full shrink-0"
          >
            <CreditCard :size="14" />
            용돈 보내기
          </RouterLink>
        </div>

        <p class="text-xs text-gray-400 mt-1">{{ wallet.walletNumber }}</p>

        <div class="flex items-center justify-between mt-3">
          <!-- 저번달 소비 유형과 일치하는 캐릭터. 유형이 바뀌면 이 이미지도 같이 바뀐다. -->
          <img
            :src="walletTypeImage"
            alt="저번달 소비 유형 캐릭터"
            class="w-24 h-24 object-contain shrink-0"
          />
          <p class="text-3xl font-bold text-gray-900">
            {{ formatMoney(walletBalance) }}
            <span class="text-lg font-medium ml-0.5">원</span>
          </p>
        </div>

        <p v-if="walletBalance === 0" class="mt-2 text-xs text-gray-600">
          현재 사용할 수 있는 잔액이 없어요.
        </p>
      </section>

      <!-- 아이의 저금통 -->
      <section class="mt-6">
        <div class="flex items-center justify-between mb-3 pl-2">
          <h2 class="text-base font-bold text-gray-900">{{ selectedChildName }}의 저금통</h2>

          <RouterLink
            :to="{ name: 'parent-piggy-list', params: { childId } }"
            class="text-sm text-muted"
          >
            모두 보기
          </RouterLink>
        </div>

        <div
          v-if="!home.piggyBanks?.length"
          class="rounded-3xl bg-white shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] p-5"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
              <Gift :size="22" class="text-avocado-600" />
            </div>

            <p class="text-sm font-medium text-gray-700">아직 만든 저금통이 없어요</p>
          </div>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="piggy in home.piggyBanks"
            :key="piggy.piggyBankId"
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
          </div>
        </div>
      </section>

      <!-- 리포트 -->
      <section class="mt-6">
        <div class="flex items-center justify-between mb-3 pl-2">
          <h2 class="text-base font-bold text-gray-900">리포트</h2>

          <RouterLink
            :to="{ name: 'parent-report', params: { childId } }"
            class="text-sm text-muted"
          >
            모두 보기
          </RouterLink>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <RouterLink
            :to="{ name: 'parent-report', params: { childId } }"
            class="rounded-2xl bg-avocado-100 p-4"
          >
            <span class="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-3">
              <CalendarDays :size="16" class="text-avocado-600" />
            </span>

            <p class="text-sm text-gray-700">오늘 사용</p>

            <p class="text-lg font-bold text-gray-900 mt-1">{{ formatMoney(home.todaySpent) }}원</p>
          </RouterLink>

          <RouterLink
            :to="{ name: 'parent-report', params: { childId } }"
            class="rounded-2xl bg-avocado-100 p-4"
          >
            <span class="w-9 h-9 rounded-full bg-white flex items-center justify-center mb-3">
              <Wallet :size="16" class="text-avocado-600" />
            </span>

            <p class="text-sm text-gray-700">이번 달 사용</p>

            <p class="text-lg font-bold text-gray-900 mt-1">{{ formatMoney(home.monthSpent) }}원</p>
          </RouterLink>
        </div>
      </section>

      <!-- 경제가 쏙쏙 -->
      <section class="mt-6">
        <div class="flex items-center justify-between mb-3 pl-2">
          <h2 class="text-base font-bold text-gray-900">경제가 쏙쏙</h2>

          <RouterLink
            :to="{ name: 'parent-newspaper', params: { childId } }"
            class="text-sm text-muted"
          >
            모두 보기
          </RouterLink>
        </div>

        <div v-if="!home.news?.length" class="rounded-2xl bg-gray-50 px-4 py-6 text-center">
          <p class="text-sm text-muted">등록된 신문이 없습니다.</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <RouterLink
            v-for="item in home.news"
            :key="item.newsId"
            :to="{
              name: 'parent-newspaper-detail',
              params: { childId, newsId: item.newsId }
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

    <div v-else-if="isLoading" class="p-4 text-center text-muted text-sm py-10">불러오는 중...</div>

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
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { CreditCard, Gift, CalendarDays, Wallet, ChevronRight } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { getSpendingType } from '@/api/report'
import { getHome } from '@/api/home'
import { getSpendingTypeImage, DEFAULT_SPENDING_TYPE_IMAGE } from '@/constants/spendingTypeImages'
import ch1 from '@/assets/images/ch1.png'
import ch2 from '@/assets/images/ch2.png'
import ch4 from '@/assets/images/ch4.png'
import ch5 from '@/assets/images/ch5.png'

const props = defineProps({
  childId: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()
const authStore = useAuthStore()
const walletStore = useWalletStore()
const { wallet, loading: walletLoading, error: walletError } = storeToRefs(walletStore)

// 로그인 응답(authStore.user.child)에 실려온, 실제로 이 부모와 연결된 아이 목록.
const children = computed(() => authStore.user?.child ?? [])
const selectedChildName = computed(
  () => children.value.find((child) => String(child.id) === String(props.childId))?.name ?? '아이'
)

const home = ref(null)
const isLoading = ref(false)
const hasRequestedWallet = ref(false)
const walletAccessError = ref('')
const walletTypeImage = ref(DEFAULT_SPENDING_TYPE_IMAGE)

const walletBalance = computed(() => Number(wallet.value?.balance ?? 0))
const walletStatusError = computed(() => walletAccessError.value || walletError.value)

// 아이 전환 아바타용 캐릭터. 소비 유형 이미지와는 무관한, 아이를 구분하기 위한 이미지일 뿐이다.
// 실제 프로필 이미지 API가 생기면 이 배열 대신 그걸로 교체한다.
const AVATAR_IMAGES = [ch1, ch2, ch4, ch5]

function getLastMonth() {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function childAvatarImage(childId) {
  const index = children.value.findIndex((child) => String(child.id) === String(childId))
  if (index < 0) return AVATAR_IMAGES[0]
  return AVATAR_IMAGES[index % AVATAR_IMAGES.length]
}

async function fetchHome() {
  isLoading.value = true
  home.value = null

  try {
    const { data } = await getHome(props.childId)
    // 백엔드는 즐겨찾기 저금통을 favoritePiggyBanks로 내려주는데,
    // 템플릿은 기존 mock 구조와 맞춰 piggyBanks라는 이름으로 읽는다.
    console.log(data.data)
    home.value = {
      todaySpent: data.data.todaySpent,
      monthSpent: data.data.monthSpent,
      piggyBanks: data.data.favoritePiggyBanks,
      news: data.data.news
    }
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

  if (!props.childId) {
    walletStore.reset()
    walletAccessError.value = '아이 정보를 확인할 수 없어요.'
    return
  }

  try {
    await walletStore.fetchWallet(props.childId)
  } catch {
    // 지갑 조회 오류 상태는 wallet store에서 관리합니다.
  }
}

async function fetchWalletTypeImage() {
  if (!props.childId) return

  try {
    const { data } = await getSpendingType(getLastMonth(), props.childId)
    walletTypeImage.value = getSpendingTypeImage(data.data?.code)
  } catch (error) {
    console.error('저번달 소비 유형 조회 실패:', error)
    walletTypeImage.value = DEFAULT_SPENDING_TYPE_IMAGE
  }
}

function onSelectChild(childId) {
  router.push({ name: 'parent-home', params: { childId } })
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

// childId가 URL 파라미터라 아이를 바꿀 때(아바타 클릭 시) 다시 불러와야 함
watch(
  () => props.childId,
  () => {
    fetchHome()
    fetchWalletBalance()
    fetchWalletTypeImage()
  }
)

onMounted(() => {
  fetchHome()
  fetchWalletBalance()
  fetchWalletTypeImage()
})
</script>
