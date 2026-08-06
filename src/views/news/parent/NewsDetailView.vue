<template>
  <div v-if="news" class="p-7 pb-8 flex flex-col gap-10">
    <div class="flex flex-col gap-4">
      <h1 class="text-xl font-bold text-gray-900">{{ news.title }}</h1>
      <p class="text-sm text-gray-700 leading-relaxed">{{ news.subtitle }}</p>

      <a
        :href="news.link"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 self-start px-3 py-2 rounded-lg text-sm font-medium text-gray-900"
        style="background-color: #ebf4dd"
      >
        기사 전문 보기
        <ExternalLink :size="14" />
      </a>
    </div>

    <div class="flex flex-col gap-4">
      <div v-if="news.todayChallenge">
        <p class="flex items-center gap-1 text-sm font-semibold text-gray-900">
          <Rocket :size="16" class="text-avocado-600" />
          오늘의 챌린지
        </p>
        <div class="rounded-xl bg-avocado-50 px-4 py-3 text-sm text-gray-900">
          {{ news.todayChallenge }}
        </div>
      </div>

      <div v-if="news.todayChallenge">
        <p class="flex items-center gap-1 text-sm font-semibold text-gray-900 mb-2">
          <Rocket :size="16" class="text-avocado-600" />
          아이의 답변
        </p>
        <div
          v-if="news.myActivity?.childAnswer"
          class="rounded-xl border border-gray-200 p-3 text-sm text-gray-900 whitespace-pre-wrap"
        >
          {{ news.myActivity.childAnswer }}
        </div>
        <div v-else class="rounded-xl border border-gray-200 p-3 text-sm text-muted">
          아직 답변하지 않았어요.
        </div>
      </div>
    </div>
  </div>

  <div v-else class="p-4 text-center text-muted text-sm py-10">불러오는 중...</div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ExternalLink, Rocket } from 'lucide-vue-next'
import { usePageTitle } from '@/composables/usePageTitle'
import { getNewsDetail } from '@/api/news'

const route = useRoute()
const { setPageTitle, clearPageTitle } = usePageTitle()

const news = ref(null)

async function fetchDetail() {
  try {
    const { data } = await getNewsDetail(route.params.newsId)
    news.value = data.data
    setPageTitle('경제가 쏙쏙! 아보카도 신문')
  } catch (error) {
    console.error('기사 상세 조회 실패:', error)
  }
}

onMounted(fetchDetail)
onUnmounted(clearPageTitle)
</script>
