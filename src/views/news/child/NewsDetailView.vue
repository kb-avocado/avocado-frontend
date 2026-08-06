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

        <p v-if="showMinLengthError" class="text-xs text-red-500 mt-2">
          최소 {{ MIN_ANSWER_LENGTH }}자를 채워야 활동을 완료할 수 있습니다.
        </p>

        <BaseButton
          variant="primary"
          class="w-full mt-3"
          :disabled="isSaving"
          @click="openCompleteConfirm"
        >
          <CheckCircle :size="16" class="mr-1" />
          활동 완료하기
        </BaseButton>
      </div>
    </div>
  </div>

  <div v-else class="p-4 text-center text-muted text-sm py-10">불러오는 중...</div>

  <ConfirmModal
    v-model="showCompleteConfirm"
    variant="complete"
    title="활동을 완료하시겠습니까?"
    @confirm="onSubmit"
  />

  <ResultModal v-model="showSavedResult" variant="success" message="저장되었습니다." />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ExternalLink, Rocket, CheckCircle } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ResultModal from '@/components/common/ResultModal.vue'
import { usePageTitle } from '@/composables/usePageTitle'
import { getNewsDetail, saveNewsAnswer } from '@/api/news'

const MIN_ANSWER_LENGTH = 3

const route = useRoute()
const { setPageTitle, clearPageTitle } = usePageTitle()

const news = ref(null)
const answer = ref('')
const isSaving = ref(false)
const showMinLengthError = ref(false)
const showCompleteConfirm = ref(false)
const showSavedResult = ref(false)

async function fetchDetail() {
  try {
    const { data } = await getNewsDetail(route.params.newsId)
    news.value = data.data
    answer.value = data.data.myActivity?.childAnswer ?? ''
    setPageTitle('경제가 쏙쏙! 아보카도 신문')
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
    const { data } = await saveNewsAnswer(route.params.newsId, answer.value)
    news.value.myActivity = {
      ...news.value.myActivity,
      childAnswer: data.data.childAnswer,
      completedAt: data.data.completedAt
    }
    showSavedResult.value = true
  } catch (error) {
    console.error('답변 저장 실패:', error)
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchDetail)
onUnmounted(clearPageTitle)
</script>
