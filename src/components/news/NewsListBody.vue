<template>
  <div class="p-4">
    <!-- 완료 상태 필터 -->
    <div class="flex items-center gap-2 mb-4">
      <button
        v-for="filterOption in FILTER_OPTIONS"
        :key="filterOption.key"
        type="button"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        :style="
          activeFilter === filterOption.key
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
        @click="changeFilter(filterOption.key)"
      >
        {{ filterOption.label }}
      </button>
    </div>

    <!-- 챌린지 안내 문구 -->
    <p class="text-xs text-muted leading-relaxed mb-4">
      신문 기사를 읽고 <span class="font-bold">챌린지</span>에 참여해요!
      <br />
      <span class="font-bold">챌린지</span>를 완료하고 생각하는 힘을 키워요.
    </p>

    <div v-if="isLoading" class="text-center text-muted text-sm py-10">
      불러오는 중...
    </div>

    <div v-else-if="errorMessage" class="text-center text-sm text-red-500 py-10">
      {{ errorMessage }}
    </div>

    <div v-else-if="newsList.length === 0" class="text-center text-muted text-sm py-10">
      {{ emptyMessage }}
    </div>

    <div v-else class="flex flex-col gap-3">
      <RouterLink
        v-for="item in newsList"
        :key="item.newsId"
        :to="{
          name: detailRouteName,
          params:
            childId != null
              ? { childId: childId, newsId: item.newsId }
              : { newsId: item.newsId }
        }"
        class="relative flex items-center justify-between h-20 pl-5 pr-4 rounded-2xl overflow-visible"
        :class="
          item.isNew
            ? ''
            : 'bg-[#f6f6f6] shadow-[0px_2px_6px_0px_rgba(191,191,191,0.4)]'
        "
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
              class="font-semibold truncate"
              :class="
                item.isRead
                  ? 'text-gray-500 font-medium'
                  : 'text-gray-900 font-bold'
              "
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

          <p class="text-xs text-muted mt-1">
            발행일: {{ formatDate(item.publishedAt) }}
          </p>
        </div>

        <img
          v-if="item.isCompleted"
          :src="getBadgeImage(item.newsId)"
          alt="참 잘했어요"
          class="w-11 h-11 rounded-full bg-white object-contain shrink-0"
        />

        <ChevronRight
          v-else
          :size="18"
          style="color: #bfbfbf"
          class="shrink-0"
        />
      </RouterLink>
    </div>

    <!-- 신문 업데이트 안내 -->
    <div
      v-if="!isLoading && !errorMessage && newsList.length > 0"
      class="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-gray-400"
    >
      <Info :size="13" :stroke-width="1.8" class="shrink-0" />

      <span>
        실제 어린이 경제신문에서 제공해주는 최신 기사를 일주일마다 업데이트 합니다.
      </span>
    </div>

    <!-- 페이지네이션 -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-center gap-2 mt-4"
    >
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
        :class="
          page === p - 1
            ? 'bg-avocado-600 text-white font-medium'
            : 'text-muted'
        "
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
import { ChevronLeft, ChevronRight, Info } from 'lucide-vue-next'

import ch11 from '@/assets/images/ch11.png'
import ch12 from '@/assets/images/ch12.png'

import { getNewsList } from '@/api/news'

const props = defineProps({
  childId: {
    type: [String, Number],
    default: null
  },
  detailRouteName: {
    type: String,
    required: true
  }
})

const PAGE_SIZE = 7

const FILTER_OPTIONS = [
  { key: 'ALL', label: '전체', completed: undefined },
  { key: 'IN_PROGRESS', label: '진행중', completed: false },
  { key: 'COMPLETED', label: '완료', completed: true }
]

const newsList = ref([])
const totalCount = ref(0)
const page = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')
const activeFilter = ref('ALL')

const totalPages = computed(() =>
  Math.ceil(totalCount.value / PAGE_SIZE)
)

const emptyMessage = computed(() => {
  if (activeFilter.value === 'COMPLETED') {
    return '아직 완료한 신문이 없어요'
  }

  if (activeFilter.value === 'IN_PROGRESS') {
    return '진행중인 신문이 없어요'
  }

  return '표시할 신문이 없어요'
})

const BADGE_IMAGES = [ch11, ch12]
const badgeImageMap = new Map()

function getBadgeImage(newsId) {
  if (!badgeImageMap.has(newsId)) {
    const randomImage =
      BADGE_IMAGES[Math.floor(Math.random() * BADGE_IMAGES.length)]

    badgeImageMap.set(newsId, randomImage)
  }

  return badgeImageMap.get(newsId)
}

async function fetchNews() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const currentFilter = FILTER_OPTIONS.find(
      (option) => option.key === activeFilter.value
    )

    const { data } = await getNewsList({
      page: page.value,
      size: PAGE_SIZE,
      ...(props.childId != null
        ? { childId: props.childId }
        : {}),
      ...(currentFilter.completed !== undefined
        ? { completed: currentFilter.completed }
        : {})
    })

    newsList.value = data.data.news
    totalCount.value = data.data.totalCount
  } catch (error) {
    console.error('신문 목록 조회 실패:', error)

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

function changeFilter(filterKey) {
  if (activeFilter.value === filterKey) return

  activeFilter.value = filterKey
  page.value = 0

  fetchNews()
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