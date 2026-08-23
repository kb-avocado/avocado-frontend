<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserRoundPlus, ChevronRight, Inbox } from 'lucide-vue-next'

import { getFamilyRequests } from '@/api/family'
import { formatMessageTime } from '@/utils/format'

const router = useRouter()

// 'loading' | 'loaded' | 'error'
const phase = ref('loading')
const requests = ref([])

// 아직 끝나지 않은 요청만 보여준다.
// 거절·취소된 요청은 보호자가 다시 할 일이 없고, ACTIVE는 이미 연결을 마친 가족이다.
const OPEN_STATUSES = ['PENDING', 'APPROVED']

const openRequests = computed(() =>
  requests.value.filter((request) => OPEN_STATUSES.includes(request.status))
)

async function fetchRequests() {
  phase.value = 'loading'

  try {
    // 상태를 가리지 않고 받아 화면에서 거른다. (보호자, 아이)가 UNIQUE라 건수가 아이 수를 넘지 않는다.
    const { data: response } = await getFamilyRequests()
    requests.value = response.data ?? []
    phase.value = 'loaded'
  } catch {
    // 401은 axios 인터셉터가 로그인 화면으로 보낸다.
    phase.value = 'error'
  }
}

/**
 * 승인·거절은 아직 아무도 손대지 않은 요청에만 할 수 있다.
 * 이미 승인한 요청을 다시 열면 확인 화면이 승인 버튼을 또 보여주고, 눌러도 서버가 409로 막는다.
 */
function openRequest(request) {
  if (request.status !== 'PENDING') return

  router.push({ name: 'family-check', params: { requestId: request.requestId } })
}

onMounted(fetchRequests)
</script>

<template>
  <div class="flex min-h-full flex-col gap-4 bg-surface p-4">
    <!-- ── 조회 중 ── -->
    <div v-if="phase === 'loading'" class="flex flex-1 items-center justify-center py-16">
      <span
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-avocado-300 border-t-transparent"
      />
    </div>

    <!-- ── 조회 실패 ── -->
    <div
      v-else-if="phase === 'error'"
      class="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <span class="text-4xl">😥</span>
      <p class="text-sm text-muted">요청 목록을 불러오지 못했어요.</p>
      <button
        type="button"
        class="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700"
        @click="fetchRequests"
      >
        다시 시도
      </button>
    </div>

    <!-- ── 조회 완료 ── -->
    <template v-else>
      <!-- 받은 요청 없음 -->
      <div
        v-if="openRequests.length === 0"
        class="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center"
      >
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-avocado-100">
          <Inbox :size="26" class="text-avocado-600" />
        </div>
        <p class="text-sm font-medium text-gray-800">새로 들어온 연결 요청이 없어요</p>
        <p class="text-xs text-muted">
          아이가 가족 연결 요청을 보내면 여기에서 확인할 수 있어요.
        </p>
      </div>

      <ul v-else class="overflow-hidden rounded-2xl bg-white shadow-sm">
        <li v-for="(request, index) in openRequests" :key="request.requestId">
          <button
            type="button"
            class="flex w-full items-center gap-3 px-5 py-4 text-left disabled:cursor-default"
            :class="index > 0 ? 'border-t border-gray-100' : ''"
            :disabled="request.status !== 'PENDING'"
            @click="openRequest(request)"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-avocado-100"
            >
              <UserRoundPlus :size="18" class="text-avocado-600" />
            </div>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-bold text-gray-900">{{ request.childName }}</p>
              <p class="truncate text-xs text-muted">
                {{ formatMessageTime(request.createdAt) }} 요청
              </p>
            </div>

            <span
              class="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="
                request.status === 'PENDING'
                  ? 'bg-avocado-100 text-avocado-700'
                  : 'bg-gray-100 text-muted'
              "
            >
              {{ request.status === 'PENDING' ? '대기중' : '자녀 확인 중' }}
            </span>

            <ChevronRight
              v-if="request.status === 'PENDING'"
              :size="16"
              class="shrink-0 text-muted"
            />
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>
