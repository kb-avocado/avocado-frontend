<!--
  공통 페이지네이션
  신문 목록(NewsListBody)과 동일한 형태를 재사용할 수 있게 분리했다.

  사용 예)
  <PaginationBar
    v-model:page="page"
    :total-pages="totalPages"
    @change="scrollToTop"
  />
-->
<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-3 pb-4">
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
      :class="page === pageNumber - 1 ? 'bg-avocado-600 text-white font-medium' : 'text-muted'"
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
</template>

<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

/* 화면에 한 번에 보여줄 최대 페이지 번호 개수 */
const PAGE_NUMBER_SIZE = 7

const props = defineProps({
  /* 현재 페이지 (0부터 시작) */
  page: {
    type: Number,
    required: true
  },

  /* 전체 페이지 수 */
  totalPages: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:page', 'change'])

/* 페이지 번호는 최대 7개까지만 노출하고, 현재 페이지를 가운데에 둔다. */
const visiblePages = computed(() => {
  const total = props.totalPages

  if (total <= PAGE_NUMBER_SIZE) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const currentPage = props.page + 1
  const half = Math.floor(PAGE_NUMBER_SIZE / 2)

  let startPage = currentPage - half
  let endPage = currentPage + half

  if (startPage < 1) {
    startPage = 1
    endPage = PAGE_NUMBER_SIZE
  }

  if (endPage > total) {
    endPage = total
    startPage = total - PAGE_NUMBER_SIZE + 1
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index)
})

function goToPage(nextPage) {
  if (nextPage < 0 || nextPage > props.totalPages - 1) return
  if (nextPage === props.page) return

  emit('update:page', nextPage)
  emit('change', nextPage)
}
</script>
