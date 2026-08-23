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
    <div class="flex items-center gap-2 mb-4">
      <img
        :src="cadoseedImage"
        alt="아보카도 씨"
        class="w-9 h-9 object-contain shrink-0"
      />

      <p class="text-xs text-muted leading-relaxed">
        신문 기사를 읽고
        <span class="font-bold">챌린지</span>에 참여해요!
        <br />
        <span class="font-bold">챌린지</span>를 완료하고 생각하는 힘을 키워요.
      </p>
    </div>

    <!-- 로딩 -->
    <div
      v-if="isLoading"
      class="text-center text-muted text-sm py-10"
    >
      불러오는 중...
    </div>

    <!-- 오류 -->
    <div
      v-else-if="errorMessage"
      class="text-center text-sm text-red-500 py-10"
    >
      {{ errorMessage }}
    </div>

    <!-- 빈 상태 -->
    <div
      v-else-if="newsList.length === 0"
      class="text-center text-muted text-sm py-10"
    >
      {{ emptyMessage }}
    </div>

    <!-- 신문 목록 -->
    <div
      v-else
      class="flex flex-col gap-3"
    >
      <RouterLink
        v-for="item in newsList"
        :key="item.newsId"
        :to="{
          name: detailRouteName,
          params:
            childId != null
              ? {
                  childId: childId,
                  newsId: item.newsId
                }
              : {
                  newsId: item.newsId
                }
        }"
        class="relative flex items-center justify-between h-[72px] pl-5 pr-4 rounded-2xl overflow-visible"
        :class="
          item.isNew
            ? ''
            : 'bg-[#f6f6f6] shadow-[0px_2px_6px_0px_rgba(191,191,191,0.4)]'
        "
        :style="
          item.isNew
            ? { backgroundColor: '#EBF4DD' }
            : undefined
        "
      >
        <!-- 왼쪽 세로 포인트 -->
        <span
          class="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-7 rounded-full"
          style="background-color: #bfbfbf"
        />

        <div
          class="min-w-0 flex-1 pr-3"
          :class="item.isRead ? 'opacity-70' : ''"
        >
          <div class="flex items-center gap-2">
            <!-- 신문 제목 -->
            <p
              class="truncate"
              :class="
                item.isRead
                  ? 'text-gray-500 font-medium'
                  : 'text-gray-700 font-bold'
              "
            >
              {{ item.title }}
            </p>

            <!-- NEW -->
            <span
              v-if="item.isNew"
              class="text-[10px] font-bold text-white rounded-full px-2 py-0.5 shrink-0"
              style="
                background-color: #c97474;
                box-shadow: inset 0 -1px 2px 0 rgba(255,255,255,0.45);
              "
            >
              NEW
            </span>
          </div>

          <p class="text-xs text-muted mt-1">
            발행일: {{ formatDate(item.publishedAt) }}
          </p>
        </div>

        <!-- 완료 배지 -->
        <img
          v-if="item.isCompleted"
          :src="getBadgeImage(item.newsId)"
          alt="참 잘했어요"
          class="w-10 h-10 rounded-full bg-white object-contain shrink-0"
        />

        <!-- 상세 이동 -->
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
      class="flex items-center justify-start gap-1.5 mt-4 text-[11px] text-gray-400"
    >
      <Info
        :size="13"
        :stroke-width="1.8"
        class="shrink-0"
      />

      <span>
        어린이 경제신문에서 제공해주는 최신 기사를 매일 업데이트합니다.
      </span>
    </div>

    <!-- 페이지네이션 -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-center gap-2 mt-3 pb-4"
    >
      <!-- 맨 처음 -->
      <button
        type="button"
        class="text-muted disabled:opacity-30"
        :disabled="page === 0"
        aria-label="첫 페이지"
        @click="goToPage(0)"
      >
        <ChevronsLeft :size="18" />
      </button>

      <!-- 이전 -->
      <button
        type="button"
        class="text-muted disabled:opacity-30"
        :disabled="page === 0"
        aria-label="이전 페이지"
        @click="goToPage(page - 1)"
      >
        <ChevronLeft :size="18" />
      </button>

      <!-- 페이지 번호 -->
      <button
        v-for="pageNumber in visiblePages"
        :key="pageNumber"
        type="button"
        class="w-7 h-7 rounded-full text-sm flex items-center justify-center"
        :class="
          page === pageNumber - 1
            ? 'bg-avocado-600 text-white font-medium'
            : 'text-muted'
        "
        @click="goToPage(pageNumber - 1)"
      >
        {{ pageNumber }}
      </button>

      <!-- 다음 -->
      <button
        type="button"
        class="text-muted disabled:opacity-30"
        :disabled="page >= totalPages - 1"
        aria-label="다음 페이지"
        @click="goToPage(page + 1)"
      >
        <ChevronRight :size="18" />
      </button>

      <!-- 맨 마지막 -->
      <button
        type="button"
        class="text-muted disabled:opacity-30"
        :disabled="page >= totalPages - 1"
        aria-label="마지막 페이지"
        @click="goToPage(totalPages - 1)"
      >
        <ChevronsRight :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
  watch
} from 'vue'

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info
} from 'lucide-vue-next'

import cadoseedImage from '@/assets/images/cadoseed.png'
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

/*
 * 한 페이지에 보여줄 기사 개수
 */
const PAGE_SIZE = 6

/*
 * 화면에 보여줄 최대 페이지 번호 개수
 */
const PAGE_NUMBER_SIZE = 7

const FILTER_OPTIONS = [
  {
    key: 'ALL',
    label: '전체',
    completed: undefined
  },
  {
    key: 'IN_PROGRESS',
    label: '진행중',
    completed: false
  },
  {
    key: 'COMPLETED',
    label: '완료',
    completed: true
  }
]

const newsList = ref([])
const totalCount = ref(0)
const page = ref(0)

const isLoading = ref(false)
const errorMessage = ref('')

const activeFilter = ref('ALL')

/*
 * 전체 페이지 수
 */
const totalPages = computed(() =>
  Math.ceil(
    totalCount.value / PAGE_SIZE
  )
)

/*
 * 페이지 번호는 최대 7개만 표시
 */
const visiblePages = computed(() => {
  const total = totalPages.value

  if (total <= PAGE_NUMBER_SIZE) {
    return Array.from(
      { length: total },
      (_, index) => index + 1
    )
  }

  const currentPage = page.value + 1
  const half = Math.floor(
    PAGE_NUMBER_SIZE / 2
  )

  let startPage =
    currentPage - half

  let endPage =
    currentPage + half

  if (startPage < 1) {
    startPage = 1
    endPage = PAGE_NUMBER_SIZE
  }

  if (endPage > total) {
    endPage = total

    startPage =
      total - PAGE_NUMBER_SIZE + 1
  }

  return Array.from(
    {
      length:
        endPage - startPage + 1
    },
    (_, index) =>
      startPage + index
  )
})

/*
 * 빈 상태 문구
 */
const emptyMessage = computed(() => {
  if (
    activeFilter.value === 'COMPLETED'
  ) {
    return '아직 완료한 신문이 없어요'
  }

  if (
    activeFilter.value === 'IN_PROGRESS'
  ) {
    return '진행중인 신문이 없어요'
  }

  return '표시할 신문이 없어요'
})

/*
 * 완료 배지
 */
const BADGE_IMAGES = [
  ch11,
  ch12
]

const badgeImageMap = new Map()

function getBadgeImage(newsId) {
  if (!badgeImageMap.has(newsId)) {
    const randomImage =
      BADGE_IMAGES[
        Math.floor(
          Math.random() *
            BADGE_IMAGES.length
        )
      ]

    badgeImageMap.set(
      newsId,
      randomImage
    )
  }

  return badgeImageMap.get(newsId)
}

/*
 * 신문 목록 조회
 */
async function fetchNews() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const currentFilter =
      FILTER_OPTIONS.find(
        (option) =>
          option.key ===
          activeFilter.value
      )

    const { data } =
      await getNewsList({
        page: page.value,
        size: PAGE_SIZE,

        ...(props.childId != null
          ? {
              childId: props.childId
            }
          : {}),

        ...(currentFilter.completed !==
        undefined
          ? {
              completed:
                currentFilter.completed
            }
          : {})
      })

    newsList.value =
      data.data.news ?? []

    totalCount.value =
      data.data.totalCount ?? 0

  } catch (error) {
    console.error(
      '신문 목록 조회 실패:',
      error
    )

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

/*
 * 필터 변경
 */
function changeFilter(filterKey) {
  if (
    activeFilter.value === filterKey
  ) {
    return
  }

  activeFilter.value = filterKey
  page.value = 0

  fetchNews()
}

/*
 * 페이지 이동
 */
function goToPage(nextPage) {
  if (
    nextPage < 0 ||
    nextPage >
      totalPages.value - 1
  ) {
    return
  }

  page.value = nextPage

  fetchNews()

  /*
   * 페이지 이동 후 화면 위쪽으로 이동
   */
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

/*
 * 날짜 출력
 */
function formatDate(dateValue) {
  if (Array.isArray(dateValue)) {
    const [
      year,
      month,
      day
    ] = dateValue

    return `${year}-${String(month).padStart(
      2,
      '0'
    )}-${String(day).padStart(
      2,
      '0'
    )}`
  }

  return (
    dateValue?.slice(0, 10) ?? ''
  )
}

/*
 * 부모 화면에서 자녀가 변경되면
 * 첫 페이지부터 다시 조회
 */
watch(
  () => props.childId,
  () => {
    page.value = 0
    fetchNews()
  }
)

onMounted(fetchNews)
</script>