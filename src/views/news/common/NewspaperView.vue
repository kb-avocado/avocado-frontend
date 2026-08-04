<template>
  <div class="p-4">
    <div class="flex items-center justify-between mb-3">
      <h1 class="text-lg font-bold text-gray-900">어린이 경제 신문</h1>
      <CalendarDays :size="20" class="text-gray-400" />
    </div>
    <p class="text-xs text-muted leading-relaxed mb-4">
      어린이 경제 신문 탭에서는<br />
      실제 어린이 경제 신문의 최신 기사를 매주 업데이트하여 제공합니다.
    </p>

    <div v-if="isLoading" class="text-center text-muted text-sm py-10">불러오는 중...</div>

    <div v-else class="flex flex-col gap-3">
      <RouterLink
        v-for="item in newsList"
        :key="item.newsId"
        :to="{ name: 'newspaper-detail', params: { newsId: item.newsId } }"
        class="flex items-center justify-between rounded-2xl px-4 py-4"
        :style="{ backgroundColor: item.isRead ? 'rgba(235, 244, 221, 0.5)' : '#EBF4DD' }"
      >
        <div>
          <div class="flex items-center gap-2">
            <p
              class="font-semibold"
              :class="item.isRead ? 'text-gray-500 font-medium' : 'text-gray-900 font-bold'"
            >
              {{ item.title }}
            </p>
            <span
              v-if="isNewArticle(item.publishedAt)"
              class="text-xs font-bold text-red-500 shrink-0"
            >
              New!!
            </span>
          </div>
          <p class="text-xs text-muted mt-1">발행일: {{ formatDate(item.publishedAt) }}</p>
        </div>

        <img
          v-if="item.isCompleted"
          :src="getBadgeImage(item.newsId)"
          alt="참 잘했어요"
          class="object-contain shrink-0"
          style="width: 56px; height: 56px; transform: translateX(-20px)"
        />
      </RouterLink>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-6">
      <button
        type="button"
        class="text-muted disabled:opacity-30"
        :disabled="page === 0"
        @click="goToPage(page - 1)"
      >
        <ChevronLeft :size="18" />
      </button>

      <button
        v-for="p in totalPages"
        :key="p"
        type="button"
        class="w-7 h-7 rounded-full text-sm flex items-center justify-center"
        :class="page === p - 1 ? 'bg-avocado-600 text-white font-medium' : 'text-muted'"
        @click="goToPage(p - 1)"
      >
        {{ p }}
      </button>

      <button
        type="button"
        class="text-muted disabled:opacity-30"
        :disabled="page >= totalPages - 1"
        @click="goToPage(page + 1)"
      >
        <ChevronRight :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ch11 from '@/assets/images/ch11.png'
import ch12 from '@/assets/images/ch12.png'

const PAGE_SIZE = 8
const NEW_BADGE_DAYS = 3 // 발행 후 3일 이내면 New!!! 표시

const newsList = ref([])
const totalCount = ref(0)
const page = ref(0)
const isLoading = ref(false)

const totalPages = computed(() => Math.ceil(totalCount.value / PAGE_SIZE))

// "참 잘했어요" 딱지 이미지 후보 2개 - ch11, ch12 중 랜덤
const BADGE_IMAGES = [ch11, ch12]

// 같은 기사에서 리렌더링될 때마다 딱지가 바뀌지 않도록, newsId별로 한 번 뽑은 결과를 고정해서 재사용
const badgeImageMap = new Map()

function getBadgeImage(newsId) {
  if (!badgeImageMap.has(newsId)) {
    const randomImage = BADGE_IMAGES[Math.floor(Math.random() * BADGE_IMAGES.length)]
    badgeImageMap.set(newsId, randomImage)
  }
  return badgeImageMap.get(newsId)
}

// TODO(mock): 백엔드 붙으면 이 계산 없이 서버가 내려주는 isNew 필드 그대로 사용
function isNewArticle(publishedAt) {
  const publishedDate = new Date(publishedAt)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - NEW_BADGE_DAYS)
  return publishedDate > cutoff
}

const MOCK_NEWS = [
  {
    newsId: 105,
    title: '폭염이 바꾼 프랑스, 에어컨 논쟁으로',
    isRead: false,
    isCompleted: false,
    publishedAt: '2026-08-02T09:00:00'
  },
  {
    newsId: 104,
    title: '일회용 스티로폼 상자 대안은?',
    isRead: false,
    isCompleted: false,
    publishedAt: '2026-08-02T09:00:00'
  },
  {
    newsId: 101,
    title: '"이 저금통은 어떻게 만들까요?"',
    isRead: true,
    isCompleted: false,
    publishedAt: '2026-07-14T09:00:00'
  },
  {
    newsId: 100,
    title: '세계유산위원회, 부산에서 열려요',
    isRead: true,
    isCompleted: true,
    publishedAt: '2026-07-14T09:00:00'
  },
  {
    newsId: 99,
    title: '생생하게 만나는 근현대사, 한국근현대사박물관',
    isRead: true,
    isCompleted: true,
    publishedAt: '2026-07-10T09:00:00'
  },
  {
    newsId: 98,
    title: '국립고궁박물관에서 만나다, 조선-프랑스 140년의 우정',
    isRead: false,
    isCompleted: false,
    publishedAt: '2026-07-10T09:00:00'
  },
  {
    newsId: 97,
    title: '내가 지킨 나라에 잠들고 싶습니다',
    isRead: true,
    isCompleted: false,
    publishedAt: '2026-07-10T09:00:00'
  },
  {
    newsId: 96,
    title: "에스컬레이터, '한 줄'에서 '두 줄'로?",
    isRead: true,
    isCompleted: true,
    publishedAt: '2026-07-10T09:00:00'
  },
  {
    newsId: 95,
    title: "'모자'로 완성하는 멋",
    isRead: true,
    isCompleted: false,
    publishedAt: '2026-07-10T09:00:00'
  },
  {
    newsId: 94,
    title: '봄철 불청객, 송홧가루',
    isRead: true,
    isCompleted: true,
    publishedAt: '2026-07-10T09:00:00'
  },
  {
    newsId: 93,
    title: '대체 항공유와 항공유, 뭐가 다를까?',
    isRead: false,
    isCompleted: false,
    publishedAt: '2026-07-10T09:00:00'
  },
  {
    newsId: 92,
    title: "네이버 플레이스, '별점 리뷰' 부활",
    isRead: false,
    isCompleted: false,
    publishedAt: '2026-07-10T09:00:00'
  },
  {
    newsId: 91,
    title: "이제 초1도 '내 카드' 쓴다",
    isRead: true,
    isCompleted: false,
    publishedAt: '2026-07-10T09:00:00'
  },
  {
    newsId: 90,
    title: "'사재기'가 만든 종량제 봉투 대란",
    isRead: true,
    isCompleted: false,
    publishedAt: '2026-07-10T09:00:00'
  },
  {
    newsId: 89,
    title: "'문화가 있는 날' 이제 매주 수요일로!",
    isRead: true,
    isCompleted: true,
    publishedAt: '2026-07-10T09:00:00'
  },
  {
    newsId: 88,
    title: '음식물 쓰레기 60%, 가정에서 나온다',
    isRead: true,
    isCompleted: true,
    publishedAt: '2026-07-10T09:00:00'
  },
  {
    newsId: 87,
    title: '도량형의 기준 된 작물, 기장',
    isRead: true,
    isCompleted: true,
    publishedAt: '2026-07-10T09:00:00'
  }
]

async function fetchNews() {
  isLoading.value = true
  try {
    // TODO(mock): 백엔드 붙으면 page/size 쿼리로 서버에서 잘라서 받아오도록 교체
    const start = page.value * PAGE_SIZE
    newsList.value = MOCK_NEWS.slice(start, start + PAGE_SIZE)
    totalCount.value = MOCK_NEWS.length
  } finally {
    isLoading.value = false
  }
}

function goToPage(nextPage) {
  if (nextPage < 0 || nextPage > totalPages.value - 1) return
  page.value = nextPage
  fetchNews()
}

function formatDate(isoString) {
  return isoString?.slice(0, 10) ?? ''
}

onMounted(fetchNews)
</script>
