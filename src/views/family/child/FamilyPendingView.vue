<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getFamilyRequest } from '@/api/family'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()

const requestId = route.params.requestId
const status = ref('PENDING') // PENDING | APPROVED
const code = ref('')
const loading = ref(false)

async function fetchStatus() {
  loading.value = true
  try {
    const { data } = await getFamilyRequest(requestId)
    status.value = data.status
    code.value = data.code ?? ''

    if (data.status === 'APPROVED') {
      // 승인됨 → 완료 화면으로 자동 전환 (같은 View 내 상태 변경)
    }
  } catch (error) {
    // 조회 실패 시 현재 상태 유지
  } finally {
    loading.value = false
  }
}

function goHome() {
  router.push({ name: 'home' })
}

onMounted(() => {
  fetchStatus()
})
</script>

<template>
  <main class="flex min-h-screen flex-col" style="background-color: var(--color-avocado-50)">
    <!-- 헤더 -->
    <header
      class="flex h-14 items-center px-4"
      style="background-color: var(--color-surface); border-bottom: 1px solid var(--color-border)"
    >
      <button
        type="button"
        class="flex items-center justify-center rounded-lg p-2"
        style="color: var(--color-text-primary)"
        @click="router.back()"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12.5 16L6.5 10L12.5 4"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div class="w-9" />
    </header>

    <div class="mx-auto flex w-full max-w-sm flex-col items-center gap-8 px-6 pt-16 pb-12">
      <!-- ── 대기 중 화면 ── -->
      <template v-if="status === 'PENDING'">
        <!-- 모래시계 아이콘 -->
        <div
          class="flex h-32 w-32 items-center justify-center rounded-full"
          style="background-color: var(--color-avocado-100)"
        >
          <div
            class="flex h-24 w-24 items-center justify-center rounded-full"
            style="background-color: var(--color-avocado-300)"
          >
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path
                d="M10 6h24M10 38h24M14 6c0 8 8 10 8 16s-8 8-8 16M30 6c0 8-8 10-8 16s8 8 8 16"
                stroke="var(--color-avocado-900)"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.7"
              />
              <path
                d="M16 32c1.5-1.5 3.5-2 6-2s4.5.5 6 2"
                stroke="var(--color-avocado-900)"
                stroke-width="2.5"
                stroke-linecap="round"
                opacity="0.7"
              />
            </svg>
          </div>
        </div>

        <!-- 텍스트 -->
        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            보호자의 승인을 기다리고 있어요!
          </h1>
          <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            보호자가 승인 버튼을 누르면<br />바로 시작할 수 있어요.
          </p>
        </div>

        <!-- 연결 코드 카드 -->
        <div
          class="flex w-full items-center justify-between rounded-2xl px-4 py-4"
          style="background-color: var(--color-surface); border: 1px solid var(--color-border)"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full text-lg"
              style="background-color: var(--color-avocado-100)"
            >
              🔗
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-xs" style="color: var(--color-text-secondary)">연결 코드</span>
              <span class="text-base font-bold" style="color: var(--color-text-primary)">
                # {{ code }}
              </span>
            </div>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            style="background-color: var(--color-avocado-100); color: var(--color-avocado-600)"
          >
            대기중
          </span>
        </div>

        <!-- 새로고침 버튼 -->
        <div class="flex w-full flex-col items-center gap-3">
          <BaseButton class="w-full" :disabled="loading" @click="fetchStatus">
            <svg
              class="mr-2 inline-block"
              :class="{ 'animate-spin': loading }"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M14 8A6 6 0 112 8M14 8V4M14 8h-4"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ loading ? '확인 중...' : '새로고침' }}
          </BaseButton>
          <p class="text-xs" style="color: var(--color-text-muted)">
            승인이 완료되면 자동으로 화면이 넘어갑니다
          </p>
        </div>
      </template>

      <!-- ── 승인 완료 화면 ── -->
      <template v-else-if="status === 'APPROVED'">
        <!-- 체크 아이콘 (glow 효과) -->
        <div class="relative flex items-center justify-center">
          <div
            class="absolute h-40 w-40 rounded-full opacity-30"
            style="background-color: var(--color-avocado-300)"
          />
          <div
            class="relative flex h-32 w-32 items-center justify-center rounded-full"
            style="background-color: var(--color-avocado-100)"
          >
            <div
              class="flex h-24 w-24 items-center justify-center rounded-full"
              style="background-color: var(--color-avocado-300)"
            >
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="var(--color-avocado-600)"
                  stroke-width="2.5"
                />
                <path
                  d="M13 22l6 6 12-12"
                  stroke="var(--color-avocado-600)"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- 텍스트 -->
        <div class="flex flex-col items-center gap-3 text-center">
          <h1 class="text-2xl font-bold" style="color: var(--color-text-primary)">
            연결이 완료되었어요!
          </h1>
          <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            이제 보호자님과 함께 아보카도를 시작해 볼까요?
          </p>
        </div>

        <!-- 시작하기 버튼 -->
        <BaseButton class="w-full" @click="goHome"> 시작하기 </BaseButton>
      </template>
    </div>
  </main>
</template>
