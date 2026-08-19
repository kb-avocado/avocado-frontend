<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getFamilyRequestCheck, updateFamilyRequest } from '@/api/family'
import BaseButton from '@/components/common/BaseButton.vue'
import SignupHeader from '@/components/common/SignupHeader.vue'

const router = useRouter()
const route = useRoute()

const requestId = route.params.requestId

// 'loading' | 'loaded' | 'load_error' | 'processing' | 'approved' | 'rejected' | 'closed'
const phase = ref('loading')
const childInfo = ref({ name: '', createdAt: '' })

// 더 이상 승인·거절할 수 없는 요청의 상태. closed 화면에서 무엇을 안내할지 정한다.
const closedStatus = ref('')
const actionError = ref('')

const CLOSED_NOTICES = {
  APPROVED: {
    emoji: '⏳',
    title: '이미 승인한 요청이에요',
    description: '자녀가 보호자를 확인하면 연결이 끝나요.'
  },
  REJECTED: {
    emoji: '🙅',
    title: '이미 거절한 요청이에요',
    description: '자녀가 코드를 다시 입력하면 새 요청이 도착해요.'
  },
  CANCELED: {
    emoji: '🙁',
    title: '자녀가 취소한 요청이에요',
    description: '자녀가 요청을 취소했어요.'
  },
  ACTIVE: {
    emoji: '✅',
    title: '이미 연결된 가족이에요',
    description: '더 확인할 것이 없어요.'
  }
}

const closedNotice = computed(
  () =>
    CLOSED_NOTICES[closedStatus.value] ?? {
      emoji: '🙁',
      title: '처리할 수 없는 요청이에요',
      description: '요청 목록에서 다시 확인해주세요.'
    }
)

async function fetchRequest() {
  phase.value = 'loading'
  actionError.value = ''

  try {
    const { data: response } = await getFamilyRequestCheck(requestId)
    const request = response.data

    childInfo.value = { name: request.childName, createdAt: request.createdAt }

    // 승인·거절은 아직 아무도 손대지 않은 요청에만 할 수 있다.
    // 자녀가 취소했거나 이미 처리한 요청에 버튼을 보여줘 봐야 서버가 409로 막는다.
    if (request.status !== 'PENDING') {
      closedStatus.value = request.status
      phase.value = 'closed'
      return
    }

    phase.value = 'loaded'
  } catch (error) {
    phase.value = 'load_error'
  }
}

async function handleDecision(decision) {
  phase.value = 'processing'
  actionError.value = ''

  try {
    await updateFamilyRequest(requestId, { decision })
    phase.value = decision === 'APPROVE' ? 'approved' : 'rejected'
  } catch (error) {
    // 409는 자녀가 취소했거나 다른 기기에서 이미 처리한 경우다.
    // 다시 조회해 화면이 실제 상태를 따라가게 하면 closed 화면으로 넘어간다.
    if (error?.response?.status === 409) {
      await fetchRequest()
      return
    }

    // 일시적인 오류는 원래 선택 화면으로 되돌리고 이유를 알린다.
    phase.value = 'loaded'
    actionError.value = '요청을 처리하지 못했어요. 잠시 후 다시 시도해주세요.'
  }
}

// 다른 화면을 보다 돌아오면 그 사이 자녀가 취소했을 수 있다. 선택 화면일 때만 다시 확인한다.
function handleVisibilityChange() {
  if (document.hidden) return
  if (phase.value !== 'loaded') return

  fetchRequest()
}

function goToRequests() {
  router.push({ name: 'family-requests' })
}

function goHome() {
  router.push({ name: 'home' })
}

onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  fetchRequest()
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <main class="flex min-h-screen flex-col" style="background-color: var(--color-surface)">
    <!-- 헤더 -->
    <SignupHeader @click-back="router.back()" />

    <div class="mx-auto flex w-full max-w-sm flex-1 flex-col items-center gap-8 px-6 pt-4 pb-12">
      <!-- ── 조회 중 ── -->
      <template v-if="phase === 'loading'">
        <div class="flex flex-1 items-center justify-center">
          <span
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-avocado-300 border-t-transparent"
          />
        </div>
      </template>

      <!-- ── 조회 실패 ── -->
      <template v-else-if="phase === 'load_error'">
        <div class="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span class="text-4xl">😥</span>
          <p class="text-sm" style="color: var(--color-text-secondary)">
            요청 정보를 불러오지 못했어요.
          </p>
          <BaseButton class="w-full" @click="fetchRequest"> 다시 시도 </BaseButton>
        </div>
      </template>

      <!-- ── 승인/거절 선택 ── -->
      <template v-else-if="phase === 'loaded' || phase === 'processing'">
        <!-- 새로운 연결 요청 뱃지 -->
        <span
          class="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
          style="background-color: var(--color-avocado-100); color: var(--color-avocado-700)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 8a3 3 0 100-6 3 3 0 000 6zM1.5 14c0-2.5 2-4.5 4.5-4.5M11.5 5v4M9.5 7h4"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          새로운 연결 요청
        </span>

        <!-- 아이 프로필 (후순위로) -->
        <div
          class="flex h-32 w-32 items-center justify-center rounded-full"
          style="
            border: 3px solid var(--color-avocado-300);
            background-color: var(--color-avocado-50);
          "
        >
          <span class="text-5xl">🏹</span>
        </div>

        <!-- 텍스트 -->
        <div class="flex flex-col items-center gap-1 text-center">
          <p class="text-xl font-bold leading-relaxed" style="color: var(--color-text-primary)">
            {{ childInfo.name }}(자녀)님이 가족 연결을 요청했어요.
          </p>
          <p v-if="childInfo.createdAt" class="text-xs" style="color: var(--color-text-muted)">
            {{ new Date(childInfo.createdAt).toLocaleString('ko-KR') }} 요청
          </p>
        </div>

        <div class="flex-1" />

        <p
          v-if="actionError"
          role="alert"
          class="w-full rounded-xl px-3.5 py-2.5 text-sm text-red-700"
          style="background-color: #fef2f2"
        >
          {{ actionError }}
        </p>

        <!-- 버튼 -->
        <div class="flex w-full flex-col gap-3">
          <BaseButton
            class="w-full"
            :disabled="phase === 'processing'"
            @click="handleDecision('APPROVE')"
          >
            {{ phase === 'processing' ? '처리 중...' : '승인하기' }}
          </BaseButton>
          <button
            type="button"
            class="w-full rounded-2xl py-3.5 text-base font-semibold"
            style="background-color: var(--color-avocado-50); color: var(--color-text-secondary)"
            :disabled="phase === 'processing'"
            @click="handleDecision('REJECT')"
          >
            거절하기
          </button>
        </div>

        <!-- 안내 문구 -->
        <p class="text-center text-xs leading-relaxed" style="color: var(--color-text-muted)">
          잘못된 요청이라면 거절해 주세요.
        </p>
      </template>

      <!-- ── 처리할 수 없는 요청 (자녀가 취소했거나 이미 처리함) ── -->
      <template v-else-if="phase === 'closed'">
        <div class="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span class="text-4xl">{{ closedNotice.emoji }}</span>
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            {{ closedNotice.title }}
          </h1>
          <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            {{ closedNotice.description }}
          </p>
        </div>

        <div class="flex w-full flex-col gap-3">
          <BaseButton class="w-full" @click="goToRequests"> 요청 목록으로 </BaseButton>
          <button
            type="button"
            class="w-full py-2 text-sm font-medium"
            style="color: var(--color-text-secondary)"
            @click="goHome"
          >
            홈으로
          </button>
        </div>
      </template>

      <!-- ── 승인 완료 ── -->
      <template v-else-if="phase === 'approved'">
        <div class="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <div
            class="flex h-24 w-24 items-center justify-center rounded-full"
            style="background-color: var(--color-avocado-100)"
          >
            <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="18" stroke="var(--color-avocado-600)" stroke-width="2.5" />
              <path
                d="M13 22l6 6 12-12"
                stroke="var(--color-avocado-600)"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            연결 요청을 승인했어요
          </h1>
          <p class="text-sm" style="color: var(--color-text-secondary)">
            {{ childInfo.name }}님이 확인 후 최종 연결됩니다.
          </p>
        </div>
        <div class="flex w-full flex-col gap-3">
          <BaseButton class="w-full" @click="goToRequests"> 요청 목록으로 </BaseButton>
          <button
            type="button"
            class="w-full py-2 text-sm font-medium"
            style="color: var(--color-text-secondary)"
            @click="goHome"
          >
            홈으로
          </button>
        </div>
      </template>

      <!-- ── 거절 완료 ── -->
      <template v-else-if="phase === 'rejected'">
        <div class="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span class="text-4xl">🙅</span>
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            연결 요청을 거절했어요
          </h1>
        </div>
        <div class="flex w-full flex-col gap-3">
          <BaseButton class="w-full" @click="goToRequests"> 요청 목록으로 </BaseButton>
          <button
            type="button"
            class="w-full py-2 text-sm font-medium"
            style="color: var(--color-text-secondary)"
            @click="goHome"
          >
            홈으로
          </button>
        </div>
      </template>
    </div>
  </main>
</template>
