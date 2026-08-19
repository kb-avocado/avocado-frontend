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
        나의 답변
      </p>
      <div class="rounded-xl border border-gray-200 p-3">
        <textarea
          v-model="answer"
          maxlength="500"
          rows="5"
          placeholder="기사를 읽고 챌린지에 대한 나의 생각을 적어보세요"
          class="w-full resize-none text-sm text-gray-900 outline-none"
        />
        <p class="text-right text-xs text-muted mt-1">{{ answer.length }} / 500</p>
      </div>

      <p v-if="showMinLengthError" class="text-xs text-red-500">
        최소 {{ MIN_ANSWER_LENGTH }}자를 채워야 챌린지를 완료할 수 있습니다.
      </p>

      <BaseButton
        variant="primary"
        class="w-full mt-1"
        :disabled="isSaving"
        @click="openCompleteConfirm"
      >
        <CheckCircle :size="16" class="mr-1" />
        {{ isEditMode ? '챌린지 수정하기' : '챌린지 완료하기' }}
      </BaseButton>
    </div>
  </div>

  <div v-else class="p-4 text-center text-muted text-sm py-10">불러오는 중...</div>

  <ConfirmModal
    v-model="showCompleteConfirm"
    variant="complete"
    :title="isEditMode ? '챌린지를 수정하시겠습니까?' : '챌린지를 완료하시겠습니까?'"
    @confirm="onSubmit"
  />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ExternalLink, Pin, CheckCircle } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { getNewsDetail, saveNewsAnswer } from '@/api/news'

const MIN_ANSWER_LENGTH = 3

const route = useRoute()
const router = useRouter()
const { setPageTitle, clearPageTitle } = usePageTitle()

const news = ref(null)
const answer = ref('')
const isSaving = ref(false)
const showMinLengthError = ref(false)
const showCompleteConfirm = ref(false)

// 이미 완료한 챌린지인지 (완료했으면 버튼/모달 문구를 "수정"으로 바꾼다)
const isEditMode = computed(() => Boolean(news.value?.myActivity?.completedAt))

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
    const { data } = await getNewsDetail(route.params.newsId)
    news.value = data.data
    answer.value = data.data.myActivity?.childAnswer ?? ''
    setPageTitle('아보카도 신문')
  } catch (error) {
    console.error('기사 상세 조회 실패:', error)
  }
}

function openCompleteConfirm() {
  if (answer.value.trim().length < MIN_ANSWER_LENGTH) {
    showMinLengthError.value = true
    return
  }
  showMinLengthError.value = false
  showCompleteConfirm.value = true
}

async function onSubmit() {
  isSaving.value = true
  try {
    await saveNewsAnswer(route.params.newsId, answer.value)
    router.push({ name: 'newspaper' })
  } catch (error) {
    console.error('답변 저장 실패:', error)
    isSaving.value = false
  }
}

onMounted(fetchDetail)
onUnmounted(clearPageTitle)
</script>
