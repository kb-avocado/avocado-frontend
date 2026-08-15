<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { requestFamilyConnect, getFamilyRequest, confirmFamilyRequest } from '@/api/family'
import BaseButton from '@/components/common/BaseButton.vue'
import { useFamilyConnectStore } from '@/stores/signup'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const familyConnectStore = useFamilyConnectStore()
const authStore = useAuthStore()

const POLL_INTERVAL = 3000
const LOST_REDIRECT_DELAY = 2500

const phase = ref('lost')

const code = familyConnectStore.code
const requestId = ref(null)
const parentInfo = ref({ name: '', image: '' })

let pollTimer = null

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

async function pollStatus() {
  try {
    // 응답은 { success, code, message, data } 구조라 실제 값은 한 겹 안에 있다.
    const { data: response } = await getFamilyRequest(requestId.value)
    const request = response.data

    if (request.status === 'APPROVED') {
      stopPolling()
      parentInfo.value = { name: request.parentName, image: '' }
      phase.value = 'confirm'
    } else if (request.status === 'REJECTED') {
      stopPolling()
      phase.value = 'rejected'
    }
    // PENDING이면 폴링 계속 유지
  } catch (error) {
    // 일시적 네트워크 오류로 간주, 폴링은 계속 유지
  }
}

async function sendRequest() {
  phase.value = 'sending'
  try {
    const { data: response } = await requestFamilyConnect({ code })
    requestId.value = response.data.requestId
    // 재로그인으로 이 화면에 다시 들어와도 같은 요청을 이어받도록 저장해둔다.
    familyConnectStore.setRequestId(requestId.value)
    phase.value = 'waiting'
    pollTimer = setInterval(pollStatus, POLL_INTERVAL)
  } catch (error) {
    phase.value = 'send_error'
  }
}

function goToCodeInput() {
  clearStoredCode()
  router.replace({ name: 'family-connect' })
}

async function handleConfirm(confirm) {
  phase.value = 'confirming'
  try {
    const { data: response } = await confirmFamilyRequest(requestId.value, confirm)
    // 연결이 확정되면 ACTIVE, 아이가 취소하면 CANCELED가 내려온다.
    const connected = response.data.status === 'ACTIVE'

    if (connected) {
      // 연결이 확정되면 서버가 계정을 ACTIVE로 바꾸고 지갑도 만든다.
      // 메모리의 로그인 정보는 아직 가입 절차 중이라 최신 정보로 맞춘다.
      try {
        await authStore.refresh()
      } catch {
        // 연결은 서버에서 이미 끝나 아이가 다시 시도할 일이 없다.
        // 갱신에 실패해도 완료 화면은 그대로 보여준다. 홈으로 갈 때 가드가 다시 물어본다.
      }
    }

    phase.value = connected ? 'done' : 'canceled'
  } catch (error) {
    // 실패 시 확인 화면으로 되돌림
    phase.value = 'confirm'
  }
}

function goHome() {
  clearStoredCode()
  router.push({ name: 'home' })
}

onMounted(() => {
  // 이미 진행 중인 요청이 있으면(재로그인 등) 새로 만들지 않고 그 요청을 이어받는다.
  // 첫 조회를 바로 해야 이미 승인된 요청이 3초를 기다리지 않고 확인 화면으로 넘어간다.
  if (familyConnectStore.requestId) {
    requestId.value = familyConnectStore.requestId
    phase.value = 'waiting'
    pollStatus()
    pollTimer = setInterval(pollStatus, POLL_INTERVAL)
    return
  }

  if (!code) {
    phase.value = 'lost'
    setTimeout(goToCodeInput, LOST_REDIRECT_DELAY)
    return
  }
  sendRequest()
})

function clearStoredCode() {
  familyConnectStore.clear()
}

onUnmounted(() => {
  stopPolling()
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
      <!-- ── code 유실 (새로고침 등) ── -->
      <template v-if="phase === 'lost'">
        <div
          class="flex h-32 w-32 items-center justify-center rounded-full"
          style="background-color: var(--color-avocado-100)"
        >
          <span class="text-4xl">⚠️</span>
        </div>
        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            요청 정보를 찾을 수 없어요
          </h1>
          <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            잠시 후 코드 입력 화면으로 이동합니다.
          </p>
        </div>
      </template>

      <!-- ── 요청 전송 중 ── -->
      <template v-else-if="phase === 'sending'">
        <div
          class="flex h-32 w-32 items-center justify-center rounded-full"
          style="background-color: var(--color-avocado-100)"
        >
          <span
            class="inline-block h-10 w-10 animate-spin rounded-full border-4 border-avocado-300 border-t-transparent"
          />
        </div>
        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            연결 요청을 보내고 있어요
          </h1>
          <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            요청이 전송되기 전까지 새로고침하지 말아주세요.
          </p>
        </div>
      </template>

      <!-- ── 요청 전송 실패 ── -->
      <template v-else-if="phase === 'send_error'">
        <div
          class="flex h-32 w-32 items-center justify-center rounded-full"
          style="background-color: var(--color-avocado-100)"
        >
          <span class="text-4xl">😥</span>
        </div>
        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            요청 전송에 실패했어요
          </h1>
          <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            다시 시도해주세요.
          </p>
        </div>
        <BaseButton class="w-full" @click="sendRequest"> 다시 시도 </BaseButton>
      </template>

      <!-- ── 대기 중 (폴링) ── -->
      <template v-else-if="phase === 'waiting'">
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

        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            보호자의 승인을 기다리고 있어요!
          </h1>
          <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            보호자가 승인 버튼을 누르면<br />바로 시작할 수 있어요.
          </p>
        </div>

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

        <p class="text-xs" style="color: var(--color-text-muted)">
          승인이 완료되면 자동으로 화면이 넘어갑니다
        </p>
      </template>

      <!-- ── 보호자가 거절함 ── -->
      <template v-else-if="phase === 'rejected'">
        <div
          class="flex h-32 w-32 items-center justify-center rounded-full"
          style="background-color: var(--color-avocado-100)"
        >
          <span class="text-4xl">🙁</span>
        </div>
        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            연결 요청이 거절되었어요
          </h1>
          <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            보호자님께 다시 코드를 받아 시도해주세요.
          </p>
        </div>
        <BaseButton class="w-full" @click="goToCodeInput"> 코드 다시 입력하기 </BaseButton>
      </template>

      <!-- ── 보호자 정보 최종 확인 ── -->
      <template v-else-if="phase === 'confirm' || phase === 'confirming'">
        <div
          class="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full"
          style="background-color: var(--color-avocado-100)"
        >
          <img
            v-if="parentInfo.image"
            :src="parentInfo.image"
            alt="보호자 프로필"
            class="h-full w-full object-cover"
          />
          <span v-else class="text-4xl">👤</span>
        </div>

        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            {{ parentInfo.name }}님이 맞나요?
          </h1>
          <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            원하셨던 보호자님이 맞는지 확인해주세요.
          </p>
        </div>

        <div class="flex w-full flex-col gap-3">
          <BaseButton
            class="w-full"
            :disabled="phase === 'confirming'"
            @click="handleConfirm(true)"
          >
            {{ phase === 'confirming' ? '확인 중...' : '네, 맞아요' }}
          </BaseButton>
          <button
            type="button"
            class="w-full py-2 text-sm font-medium"
            style="color: var(--color-text-secondary)"
            :disabled="phase === 'confirming'"
            @click="handleConfirm(false)"
          >
            아니에요, 다른 사람이에요
          </button>
        </div>
      </template>

      <!-- ── 아이가 확인 거부함 ── -->
      <template v-else-if="phase === 'canceled'">
        <div
          class="flex h-32 w-32 items-center justify-center rounded-full"
          style="background-color: var(--color-avocado-100)"
        >
          <span class="text-4xl">🙁</span>
        </div>
        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            연결이 취소되었어요
          </h1>
          <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            보호자님께 정확한 코드를 다시 받아 시도해주세요.
          </p>
        </div>
        <BaseButton class="w-full" @click="goToCodeInput"> 코드 다시 입력하기 </BaseButton>
      </template>

      <!-- ── 최종 연결 완료 ── -->
      <template v-else-if="phase === 'done'">
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

        <div class="flex flex-col items-center gap-3 text-center">
          <h1 class="text-2xl font-bold" style="color: var(--color-text-primary)">
            연결이 완료되었어요!
          </h1>
          <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            이제 보호자님과 함께 아보카도를 시작해 볼까요?
          </p>
        </div>

        <BaseButton class="w-full" @click="goHome"> 시작하기 </BaseButton>
      </template>
    </div>
  </main>
</template>
