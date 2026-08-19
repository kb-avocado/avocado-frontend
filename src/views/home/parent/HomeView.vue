<template>

<!--

    TODO: 연결된 아이가 없는 부모 홈. 지금은 안내 문구만 있다.

    초대 코드 안내나 아이 연결 유도 등 실제 화면은 따로 구현해야 한다.

  -->

  <NoChildConnected v-if="!hasChildren" />

  <div v-else class="p-4 flex flex-col gap-6">

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

    <div v-if="home" class="flex flex-col gap-6">

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

<!-- 지갑 카드: 아이 홈과 동일한 스펙(padding, gap, radius, 단색 #EBF4DD, 박음질 테두리, 잠금 탭) -->

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

class="relative w-32 h-32 object-contain mt-2"

        />

        <div>

          <p class="text-lg font-bold text-gray-900">{{ selectedChildName }}의 아보카도 지갑</p>

          <p class="text-xs text-gray-400 mt-1">{{ wallet.walletNumber }}</p>

        </div>

        <p class="text-3xl font-bold text-gray-900">

          {{ formatMoney(walletBalance) }}

          <span class="text-lg font-medium ml-0.5">원</span>

        </p>

        <RouterLink

          :to="{ name: 'parent-transfer', params: { childId } }"

class="w-full text-center bg-white text-sm font-medium py-3 rounded-full flex items-center justify-center gap-1"

style="color: #366a1b"

        >

          <CreditCard :size="14" />

          용돈 보내기

        </RouterLink>

        <p v-if="walletBalance === 0" class="text-xs text-gray-600">

          현재 사용할 수 있는 잔액이 없어요.

        </p>

      </section>

<!-- 아이의 저금통 -->

      <section>

        <div class="flex items-center justify-between mb-3 pl-2">

          <h2 class="text-base font-bold text-gray-900">{{ selectedChildName }}의 저금통</h2>

          <RouterLink

            :to="{ name: 'parent-piggy-list', params: { childId } }"

class="text-sm text-muted"

          >

            모두 보기

          </RouterLink>

        </div>

<!-- 저금통이 없을 때 -->

        <RouterLink

v-if="!home.piggyBanks?.length"

          :to="{ name: 'parent-piggy-list', params: { childId } }"

class="flex items-center justify-between rounded-full bg-white shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] px-6 py-5"

        >

          <p class="text-sm font-medium text-gray-500">

            {{ home.hasPiggyBanks ? '즐겨찾는 저금통이 없습니다' : '저금통이 없습니다' }}

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

              name: 'piggyDetail',

              params: { childId, id: piggy.piggyBankId }

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

                <div

class="h-3 mt-2 overflow-hidden rounded-full"

style="background-color: #ebebeb"

                >

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

            :to="{ name: 'parent-report', params: { childId } }"

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

            :to="{ name: 'parent-report', params: { childId } }"

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

          <div v-if="!home.news?.length" class="rounded-2xl bg-gray-50 px-4 py-6 text-center">

            <p class="text-sm text-muted">등록된 신문이 없습니다.</p>

          </div>

          <RouterLink

v-else

v-for="item in home.news"

            :key="item.newsId"

            :to="{

              name: 'parent-newspaper-detail',

              params: { childId, newsId: item.newsId }

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

import { computed, nextTick, onMounted, ref, watch } from 'vue'

import { useRouter } from 'vue-router'

import { storeToRefs } from 'pinia'

import { CreditCard, CalendarDays, Plus, Wallet, ChevronRight } from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'

import { resolveHomeRoute } from '@/router/landing'

import { useWalletStore } from '@/stores/wallet'

import { getSpendingType } from '@/api/report'

import { getHome } from '@/api/home'

import { getSpendingTypeImage, DEFAULT_SPENDING_TYPE_IMAGE } from '@/constants/spendingTypeImages'

import NoChildConnected from '@/components/common/NoChildConnected.vue'

import ch11 from '@/assets/images/ch11.png'

import ch12 from '@/assets/images/ch12.png'

const props = defineProps({

// 연결된 아이가 없는 부모는 childId 없이 이 화면에 들어온다.

  childId: {

    type: [String, Number],

    default: ''

}

})

const router = useRouter()

const authStore = useAuthStore()

const walletStore = useWalletStore()

const { wallet, loading: walletLoading, error: walletError } = storeToRefs(walletStore)

// 로그인 응답(authStore.user.child)에 실려온, 실제로 이 부모와 연결된 아이 목록.

const children = computed(() => authStore.user?.child ?? [])

const hasChildren = computed(() => children.value.length > 0)

const selectedChildName = computed(

() => children.value.find((child) => String(child.id) === String(props.childId))?.name ?? '아이'

)

// 소비/신문 토글: 아이 홈과 동일하게 "리포트"/"경제가 쏙쏙" 두 섹션을 하나로 합침

const HOME_TAB_OPTIONS = [

{ key: 'SPENDING', label: '소비' },

{ key: 'NEWS', label: '신문' }

]

const activeHomeTab = ref('SPENDING')

const homeTabMoreLink = computed(() =>

activeHomeTab.value === 'SPENDING'

? { name: 'parent-report', params: { childId: props.childId } }

: { name: 'parent-newspaper', params: { childId: props.childId } }

)

const home = ref(null)

// 저금통 진행바를 0% → 실제 진행률로 슈욱 차오르게 하는 연출용 플래그

const piggyBarsRevealed = ref(false)

const isLoading = ref(false)

const hasRequestedWallet = ref(false)

const walletAccessError = ref('')

const walletTypeImage = ref(DEFAULT_SPENDING_TYPE_IMAGE)

const walletBalance = computed(() => Number(wallet.value?.balance ?? 0))

const walletStatusError = computed(() => walletAccessError.value || walletError.value)

// 아이 전환 아바타에 쓸 이미지: 아이 홈 지갑 카드와 같은 "저번달 소비 유형" 캐릭터.

// childId별로 조회해서 캐싱해두고, 아직 조회 전이거나 실패하면 기본 이미지로 보여준다.

const childTypeImages = ref({})

function getLastMonth() {

  const now = new Date()

  const date = new Date(now.getFullYear(), now.getMonth() - 1, 1)

return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

}

function childAvatarImage(childId) {

return childTypeImages.value[String(childId)] ?? DEFAULT_SPENDING_TYPE_IMAGE

}

// 전환 목록에 있는 모든 아이의 소비 유형 이미지를 미리 받아온다.

async function fetchChildrenTypeImages() {

await Promise.all(

children.value.map(async (child) => {

try {

        const { data } = await getSpendingType(getLastMonth(), child.id)

childTypeImages.value[String(child.id)] = getSpendingTypeImage(data.data?.code)

      } catch (error) {

console.error(`${child.name} 소비 유형 조회 실패:`, error)

childTypeImages.value[String(child.id)] = DEFAULT_SPENDING_TYPE_IMAGE

      }

    })

  )

}

async function fetchHome() {

isLoading.value = true

home.value = null

piggyBarsRevealed.value = false

try {

    const { data } = await getHome(props.childId)

// 백엔드는 즐겨찾기 저금통을 favoritePiggyBanks로 내려주는데,

// 템플릿은 기존 mock 구조와 맞춰 piggyBanks라는 이름으로 읽는다.

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

// 이미 전체 아이 목록 조회에서 캐싱된 값이 있으면 그걸 그대로 쓴다.

  if (childTypeImages.value[String(props.childId)]) {

walletTypeImage.value = childTypeImages.value[String(props.childId)]

return

  }

try {

    const { data } = await getSpendingType(getLastMonth(), props.childId)

    const image = getSpendingTypeImage(data.data?.code)

walletTypeImage.value = image

childTypeImages.value[String(props.childId)] = image

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

// 저금통 생성 시 고른 아이콘을 그대로 보여준다.

// (components/piggy/ChildPiggyBankCard.vue와 동일한 폴백 로직)

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

// childId가 URL 파라미터라 아이를 바꿀 때(아바타 클릭 시) 다시 불러와야 함

watch(

  () => props.childId,

  () => {

fetchHome()

fetchWalletBalance()

fetchWalletTypeImage()

  }

)

watch(hasChildren, (has) => {

  if (!has) return

  if (props.childId) return

router.replace(resolveHomeRoute(authStore.user))

})

onMounted(async () => {

await authStore.refresh().catch(() => {})

// 연결된 아이가 없으면 조회할 대상도 없다.

  if (!hasChildren.value) return

fetchHome()

fetchWalletBalance()

fetchChildrenTypeImages().then(fetchWalletTypeImage)

})

</script>