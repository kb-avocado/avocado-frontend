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
        class="flex items-center justify-between rounded-2xl bg-avocado-50 px-4 py-4"
      >
        <div>
          <p class="font-semibold text-gray-900">{{ item.title }}</p>
          <p class="text-xs text-muted mt-1">발행일: {{ formatDate(item.publishedAt) }}</p>
        </div>
        <span v-if="item.isNew" class="text-xs font-bold text-red-500 shrink-0 ml-2"> New!!! </span>
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
// TODO(mock): 백엔드 붙으면 아래 주석 풀고 mock 코드 지우기
// import { getNewsList } from '@/api/news'

const PAGE_SIZE = 5

const newsList = ref([])
const totalCount = ref(0)
const page = ref(0)
const isLoading = ref(false)

const totalPages = computed(() => Math.ceil(totalCount.value / PAGE_SIZE))

// TODO(mock): 백엔드 붙으면 이 목업 배열 삭제
const MOCK_NEWS = [
  { newsId: 105, title: '목돈, 어떻게 만드나요?', isNew: true, publishedAt: '2026-07-17T09:00:00' },
  { newsId: 104, title: '보너스란 무엇일까요?', isNew: false, publishedAt: '2026-07-21T09:00:00' },
  {
    newsId: 101,
    title: '이 저금통은 어떻게 만들까요?',
    isNew: false,
    publishedAt: '2026-07-14T09:00:00'
  },
  {
    newsId: 100,
    title: '복리에 대해서 알아봐요',
    isNew: false,
    publishedAt: '2026-07-14T09:00:00'
  },
  { newsId: 99, title: '용돈 기입장 쓰는 법', isNew: false, publishedAt: '2026-07-10T09:00:00' }
]

async function fetchNews() {
  isLoading.value = true
  try {
    // TODO(mock): 백엔드 붙으면 아래로 교체
    // const { data } = await getNewsList({ page: page.value, size: PAGE_SIZE })
    // newsList.value = data.news
    // totalCount.value = data.totalCount
    newsList.value = MOCK_NEWS
    totalCount.value = 12 // mock: 페이지네이션 확인용
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
