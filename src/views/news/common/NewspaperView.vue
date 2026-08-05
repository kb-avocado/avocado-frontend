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
import { getNewsList } from '@/api/news'

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


async function fetchNews() {
  isLoading.value = true
  try {
    const { data } = await getNewsList({ page: page.value, size: PAGE_SIZE })
    newsList.value = data.data.news
    totalCount.value = data.data.totalCount
  } finally {
    isLoading.value = false
  }
}

function goToPage(nextPage) {
  if (nextPage < 0 || nextPage > totalPages.value - 1) return
  page.value = nextPage
  fetchNews()
}

function formatDate(dateValue) {
  if (Array.isArray(dateValue)) {
    const [year, month, day] = dateValue
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
  return dateValue?.slice(0, 10) ?? ''
}

onMounted(fetchNews)
</script>
