<template>
  <div v-if="news" class="p-4 pb-8 flex flex-col gap-5">
    <div>
      <h1 class="text-lg font-bold text-gray-900 mb-2">{{ news.headline ?? news.title }}</h1>
      <p class="text-sm text-gray-700 leading-relaxed">{{ news.summary }}</p>
    </div>

    <a>
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
          placeholder="챌린지에 대한 나의 생각을 적어보세요"
          class="w-full resize-none text-sm text-gray-900 outline-none disabled:bg-white"
        />
        <p class="text-right text-xs text-muted mt-1">{{ answer.length }} / 500</p>
      </div>

      <BaseButton
        v-if="canEditAnswer"
        variant="primary"
        class="w-full mt-3"
        :disabled="!answer.trim() || isSaving"
        @click="onSubmit"
      >
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
// TODO(mock): 백엔드 붙으면 아래 주석 풀고 mock 코드 지우기
// import { getNewsDetail, saveNewsAnswer } from '@/api/news'
import { useAuthStore } from '@/stores/auth'
import { usePageTitle } from '@/composables/usePageTitle'

const route = useRoute()
const authStore = useAuthStore()
const { setPageTitle, clearPageTitle } = usePageTitle()

const news = ref(null)
const answer = ref('')
const isSaving = ref(false)

// TODO: 로그인 붙으면 authStore.user.role로 정확히 판단.
// 로그인 전 개발 단계에서는 기본적으로 아이(편집 가능)로 취급.
const canEditAnswer = computed(() => authStore.user?.role !== 'PARENT')

// TODO(mock): 백엔드 붙으면 이 목업 객체 삭제
const MOCK_NEWS_DETAIL = {
  newsId: 104,
  title: '보너스란 무엇일까요?',
  headline: '돈을 불리는 마법: 복리의 비밀',
  summary:
    '내 돈이 아기를 낳고, 그 아기가 또 아기를 낳는다면? 바로 복리의 원리에요! 우리 돈이 슈퍼히어로 팀처럼 일하게 만드는 법을 배워봅시다.',
  url: 'https://news.example.com/articles/bonus-explained',
  publishedAt: '2026-07-21T09:00:00',
  challenge: {
    challengeId: 5,
    title: "기사 속 사건을 '10년 후 가상 뉴스'로 다시 써보기"
  },
  myAnswer: null
}

async function fetchDetail() {
  // TODO(mock): 백엔드 붙으면 아래로 교체
  // const { data } = await getNewsDetail(route.params.newsId)
  const data = { ...MOCK_NEWS_DETAIL, newsId: route.params.newsId }
  news.value = data
  answer.value = data.myAnswer?.review ?? ''
  setPageTitle(data.title)
}

async function onSubmit() {
  isSaving.value = true
  try {
    // TODO(mock): 백엔드 붙으면 아래로 교체
    // await saveNewsAnswer(route.params.newsId, answer.value)
    console.log('mock 저장:', answer.value)
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchDetail)
onUnmounted(clearPageTitle)
</script>
