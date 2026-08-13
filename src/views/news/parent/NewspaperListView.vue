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

    <!-- 정렬 기준 구분선 -->
    <div class="relative flex items-center justify-center mb-4">
      <div class="absolute inset-x-0 top-1/2 h-px bg-gray-200" />
      <span class="relative bg-white px-3 text-xs text-muted">최신 발행 순</span>
    </div>

    <div v-if="isLoading" class="text-center text-muted text-sm py-10">불러오는 중...</div>

    <div v-else-if="errorMessage" class="text-center text-sm text-red-500 py-10">
      {{ errorMessage }}
    </div>

    <div v-else class="flex flex-col gap-3">
      <RouterLink
        v-for="item in newsList"
        :key="item.newsId"
        :to="{
          name: 'parent-newspaper-detail',
          params: { childId: childId, newsId: item.newsId }
        }"
        class="relative flex items-center justify-between h-20 pl-7 pr-4 rounded-2xl overflow-visible bg-[#f6f6f6] shadow-[0px_2px_6px_0px_rgba(191,191,191,0.4)]"
        :class="item.isRead ? 'opacity-50' : ''"
      >
        <!-- 티켓 탭 -->
        <span
          class="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-10 rounded-full"
          style="background-color: #bfbfbf"
        />

        <div class="min-w-0 flex-1 pr-3">
          <div class="flex items-center gap-2">
            <p
              class="font-semibold truncate"
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
import { computed, onMounted, ref, watch } from 'vue'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ch11 from '@/assets/images/ch11.png'
import ch12 from '@/assets/images/ch12.png'
import { getNewsList } from '@/api/news'

const props = defineProps({
  childId: {
    type: [String, Number],
    required: true
  }
})

const PAGE_SIZE = 6

const newsList = ref([])
const totalCount = ref(0)
const page = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')

const totalPages = computed(() => Math.ceil(totalCount.value / PAGE_SIZE))

const BADGE_IMAGES = [ch11, ch12]
const badgeImageMap = new Map()

function getBadgeImage(newsId) {
  if (!badgeImageMap.has(newsId)) {
    const randomImage = BADGE_IMAGES[Math.floor(Math.random() * BADGE_IMAGES.length)]
    badgeImageMap.set(newsId, randomImage)
  }
  return badgeImageMap.get(newsId)
}

async function fetchNews() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const { data } = await getNewsList({
      page: page.value,
      size: PAGE_SIZE,
      childId: props.childId
    })
    newsList.value = data.data.news
    totalCount.value = data.data.totalCount
  } catch (error) {
    console.error('신문 목록 조회 실패:', error)
    // 실패한 아이의 목록이 이전 아이 데이터로 잘못 보이지 않도록 비워준다
    newsList.value = []
    totalCount.value = 0
    errorMessage.value =
      error.response?.status === 403
        ? '이 아이의 신문을 조회할 권한이 없습니다.'
        : '신문 목록을 불러오지 못했습니다.'
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

watch(
  () => props.childId,
  () => {
    page.value = 0
    fetchNews()
  }
)

onMounted(fetchNews)
</script>
