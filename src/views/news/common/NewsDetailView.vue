<template>
  <div v-if="news" class="p-4 pb-8 flex flex-col gap-5">
    <div>
      <h1 class="text-xl font-bold text-gray-900 mb-2">{{ news.title }}</h1>
      <p class="text-sm text-gray-700 leading-relaxed">{{ news.summary }}</p>
    </div>

    <a
      :href="news.url"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1 self-start px-3 py-2 rounded-lg text-sm font-medium text-gray-900"
      style="background-color: #ebf4dd"
    >
      기사 전문 보기
      <ExternalLink :size="14" />
    </a>

    <div v-if="news.challenge">
      <p class="flex items-center gap-1 text-sm font-semibold text-gray-900 mb-2">
        <Rocket :size="16" class="text-avocado-600" />
        오늘의 챌린지
      </p>
      <div class="rounded-xl bg-avocado-50 px-4 py-3 text-sm text-gray-900">
        {{ news.challenge.title }}
      </div>
    </div>

    <div v-if="news.challenge">
      <p class="flex items-center gap-1 text-sm font-semibold text-gray-900 mb-2">
        <Rocket :size="16" class="text-avocado-600" />
        나의 답변
      </p>
      <div class="rounded-xl border border-gray-200 p-3">
        <textarea
          v-model="answer"
          :readonly="!canEditAnswer"
          maxlength="500"
          rows="5"
          placeholder="기사를 읽고 챌린지에 대한 나의 생각을 적어보세요"
          class="w-full resize-none text-sm text-gray-900 outline-none disabled:bg-white"
        />
        <p class="text-right text-xs text-muted mt-1">{{ answer.length }} / 500</p>
      </div>

      <p v-if="showMinLengthError" class="text-xs text-red-500 mt-2">
        최소 {{ MIN_ANSWER_LENGTH }}자를 채워야 활동을 완료할 수 있습니다.
      </p>

      <BaseButton v-if="canEditAnswer" variant="primary" class="w-full mt-3" @click="onSubmit">
        <CheckCircle :size="16" class="mr-1" />
        활동 완료하기
      </BaseButton>
    </div>
  </div>

  <div v-else class="p-4 text-center text-muted text-sm py-10">불러오는 중...</div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ExternalLink, Rocket, CheckCircle } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { usePageTitle } from '@/composables/usePageTitle'

const MIN_ANSWER_LENGTH = 50

const route = useRoute()
const authStore = useAuthStore()
const { setPageTitle, clearPageTitle } = usePageTitle()

const news = ref(null)
const answer = ref('')
const isSaving = ref(false)
const showMinLengthError = ref(false)

const canEditAnswer = computed(() => authStore.user?.role !== 'PARENT')

const MOCK_NEWS_DETAIL = {
  newsId: 105,
  title: '폭염이 바꾼 프랑스, 에어컨 논쟁으로',
  summary:
    '프랑스가 기록적인 폭염으로 큰 어려움을 겪고 있어요. 일부 지역의 낮 최고 기온은 40도를 훌쩍 넘기기도 했죠. 그런데 프랑스는 우리나라와 달리 에어컨을 설치한 곳이 많지 않아요. ',
  url: 'https://www.econoi.com/news/articleView.html?idxno=42228',
  publishedAt: '2026-07-21T09:00:00',
  challenge: {
    challengeId: 5,
    title: "기사 속 사건을 '10년 후 가상 뉴스'로 다시 써보기"
  },
  myAnswer: null
}

async function fetchDetail() {
  const data = { ...MOCK_NEWS_DETAIL, newsId: route.params.newsId }
  news.value = data
  answer.value = data.myAnswer?.review ?? ''
  setPageTitle('경제가 쏙쏙! 아보카도 신문')
}

async function onSubmit() {
  if (answer.value.trim().length < MIN_ANSWER_LENGTH) {
    showMinLengthError.value = true
    return
  }
  showMinLengthError.value = false

  isSaving.value = true
  try {
    console.log('mock 저장:', answer.value)
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchDetail)
onUnmounted(clearPageTitle)
</script>
