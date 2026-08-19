<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getFamilyRequestCheck, updateFamilyRequest } from '@/api/family'
import BaseButton from '@/components/common/BaseButton.vue'
import SignupHeader from '@/components/common/SignupHeader.vue'

const router = useRouter()
const route = useRoute()

const requestId = route.params.requestId

'loading' | 'loaded' | 'load_error' | 'processing' | 'approved' | 'rejected'
const phase = ref('loading')
const childInfo = ref({ name: '', createdAt: '' })

async function fetchRequest() {
  phase.value = 'loading'
  try {
    const { data: response } = await getFamilyRequestCheck(requestId)
    const request = response.data

    childInfo.value = { name: request.childName, createdAt: request.createdAt }
    phase.value = 'loaded'
  } catch (error) {
    phase.value = 'load_error'
  }
}

async function handleDecision(decision) {
  phase.value = 'processing'
  try {
    await updateFamilyRequest(requestId, { decision })
    phase.value = decision === 'APPROVE' ? 'approved' : 'rejected'
  } catch (error) {
    // 실패 시 원래 선택 화면으로 되돌림
    phase.value = 'loaded'
  }
}

function goHome() {
  router.push({ name: 'home' })
}

onMounted(() => {
  fetchRequest()
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
        <BaseButton class="w-full" @click="goHome"> 홈으로 </BaseButton>
      </template>

      <!-- ── 거절 완료 ── -->
      <template v-else-if="phase === 'rejected'">
        <div class="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <span class="text-4xl">🙅</span>
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            연결 요청을 거절했어요
          </h1>
        </div>
        <BaseButton class="w-full" @click="goHome"> 홈으로 </BaseButton>
      </template>
    </div>
  </main>
</template>
