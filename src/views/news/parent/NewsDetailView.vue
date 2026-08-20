<template>
  <div v-if="news" class="p-7 pb-8 flex flex-col gap-6">
    <div class="flex flex-col gap-2 pb-6 border-b border-gray-100">
      <h1 class="text-2xl font-bold text-gray-900 leading-snug">{{ news.title }}</h1>
      <p class="text-sm text-gray-300">{{ formatDate(news.publishedAt) }}</p>
    </div>

    <!-- Intro -->
    <div class="rounded-2xl px-5 py-4 flex flex-col gap-3" style="background-color: #eef0fb">
      <p class="text-sm font-bold text-gray-900">기사 미리보기</p>
      <p class="text-sm text-gray-800 leading-relaxed">{{ news.subtitle }}</p>

      <a
        :href="news.link"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 self-start text-sm font-medium"
        style="color: #8b6fd4"
      >
        기사 전문 보기
        <ExternalLink :size="14" />
      </a>
    </div>

    <div v-if="news.todayChallenge" class="pt-6 border-t border-gray-100 flex flex-col gap-2">
      <p class="flex items-center gap-1 text-sm font-bold text-gray-900">
        <Pin :size="16" class="text-red-500" />
        오늘의 챌린지
      </p>
      <p class="text-sm text-gray-500 leading-relaxed">{{ news.todayChallenge }}</p>
    </div>

    <div v-if="news.todayChallenge" class="pt-6 border-t border-gray-100 flex flex-col gap-2">
      <p class="flex items-center gap-1 text-sm font-bold text-gray-900">
        <Pin :size="16" class="text-red-500" />
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

  <div v-else class="p-4 text-center text-muted text-sm py-10">불러오는 중...</div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ExternalLink, Pin } from 'lucide-vue-next'
import { usePageTitle } from '@/composables/usePageTitle'
import { getNewsDetail } from '@/api/news'

const props = defineProps({
  childId: {
    type: [String, Number],
    required: true
  }
})

const route = useRoute()
const { setPageTitle, clearPageTitle } = usePageTitle()

const news = ref(null)

function formatDate(dateValue) {
  if (!dateValue) return ''

  if (Array.isArray(dateValue)) {
    const [year, month, day] = dateValue
    return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
  }

  return dateValue.slice(0, 10).replaceAll('-', '.')
}

async function fetchDetail() {
  try {
    const { data } = await getNewsDetail(route.params.newsId, props.childId)
    news.value = data.data
    setPageTitle('아보카도 신문')
  } catch (error) {
    console.error('기사 상세 조회 실패:', error)
  }
}

onMounted(fetchDetail)
onUnmounted(clearPageTitle)
</script>
