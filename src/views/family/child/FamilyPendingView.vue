<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { requestFamilyConnect, getFamilyRequest, confirmFamilyRequest } from '@/api/family'
import BaseButton from '@/components/common/BaseButton.vue'
import SignupHeader from '@/components/common/SignupHeader.vue'
import { useFamilyConnectStore } from '@/stores/signup'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const familyConnectStore = useFamilyConnectStore()
const authStore = useAuthStore()

const POLL_INTERVAL = 3000
// 폴링을 유지하는 시간
const POLL_TIMEOUT = 3 * 60 * 1000
const LOST_REDIRECT_DELAY = 3000

const phase = ref('lost')

const code = familyConnectStore.code
const requestId = ref(null)
const parentInfo = ref({ name: '', image: '' })

// 취소는 어느 화면에서든 누를 수 있어 phase와 따로 둔다.
const canceling = ref(false)
const cancelError = ref('')

let pollTimer = null
// 이 시각을 넘기면 폴링을 멈춘다. 탭을 잠시 벗어났다 돌아와도 기한은 그대로다.
let pollExpiresAt = 0

// 남은 시간은 분 단위로만 보여준다. 초를 세자고 타이머를 따로 두지 않고
// 3초마다 도는 폴링에 얹어 갱신한다
const remainingMinutes = ref(0)

function syncRemainingMinutes() {
  remainingMinutes.value = Math.max(1, Math.round((pollExpiresAt - Date.now()) / 60000))
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

/**
 * 남은 기한 동안 폴링을 돌린다.
 * renew는 기한을 지금부터 다시 세는 경우(요청을 새로 보냈거나 사용자가 더 기다리기로 한 경우)다.
 */
function startPolling({ renew = false } = {}) {
  if (renew) pollExpiresAt = Date.now() + POLL_TIMEOUT

  stopPolling()

  if (Date.now() >= pollExpiresAt) {
    phase.value = 'timeout'
    return
  }

  syncRemainingMinutes()
  pollTimer = setInterval(pollStatus, POLL_INTERVAL)
}

/**
 * 요청 상태를 한 번 확인하고, 끝난 요청이면 그에 맞는 화면으로 넘긴다.
 * 기한을 보지 않아 폴링이 멈춘 뒤에도 단발로 부를 수 있다.
 */
async function checkStatusOnce() {
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
    } else if (request.status === 'CANCELED') {
      // 다른 기기에서 취소했거나, 아이가 다른 코드로 새 요청을 보내 이 요청이 정리된 경우다.
      stopPolling()
      phase.value = 'canceled'
    }
    // PENDING이면 아직 진행 중이라 화면을 그대로 둔다.
  } catch (error) {
    // 일시적 네트워크 오류로 간주하고 화면을 그대로 둔다.
  }
}

async function pollStatus() {
  // 기한이 지나면 요청만 멈춘다. 서버의 연결 요청은 PENDING으로 살아 있어
  // 보호자가 나중에 승인해도 그대로 이어진다.
  if (Date.now() >= pollExpiresAt) {
    stopPolling()
    phase.value = 'timeout'
    return
  }

  syncRemainingMinutes()

  await checkStatusOnce()
}

async function sendRequest() {
  phase.value = 'sending'
  try {
    const { data: response } = await requestFamilyConnect({ code })
    requestId.value = response.data.requestId
    // 재로그인으로 이 화면에 다시 들어와도 같은 요청을 이어받도록 저장해둔다.
    familyConnectStore.setRequestId(requestId.value)
    phase.value = 'waiting'
    startPolling({ renew: true })
  } catch (error) {
    phase.value = 'send_error'
  }
}

// 기한이 지난 뒤 사용자가 더 기다리기로 한 경우. 기한을 새로 잡고 바로 한 번 확인한다.
function resumePolling() {
  cancelError.value = ''
  phase.value = 'waiting'
  startPolling({ renew: true })
  pollStatus()
}

/**
 * 아이가 스스로 연결 요청을 거둔다.
 * 보호자의 승인 전이든 후든 CANCELED로 정리돼, 보호자 쪽 요청 목록에서도 사라진다.
 */
async function handleCancel() {
  if (canceling.value) return

  canceling.value = true
  cancelError.value = ''
  stopPolling()

  try {
    await confirmFamilyRequest(requestId.value, false)

    // 메모리의 로그인 정보에는 이 요청이 아직 진행 중으로 남아 있다.
    // 맞춰두지 않으면 가드가 코드를 다시 입력하는 길에 끝난 요청을 도로 집어든다.
    try {
      await authStore.refresh()
    } catch {
      // 취소는 서버에서 이미 끝났다. 갱신에 실패해도 화면을 막지 않는다.
    }

    familyConnectStore.clear()
    phase.value = 'canceled'
  } catch (error) {
    // 취소하지 못했으면 요청은 그대로 살아 있다. 보던 화면으로 되돌린다.
    cancelError.value = '요청을 취소하지 못했어요. 잠시 후 다시 시도해주세요.'
    if (phase.value === 'waiting') startPolling()
  } finally {
    canceling.value = false
  }
}

/**
 * 탭이 가려진 동안에는 화면을 갱신할 이유가 없다.
 * 돌아오면 즉시 한 번 확인하고, 기한이 남아 있으면 다시 돌린다.
 */
async function handleVisibilityChange() {
  if (document.hidden) {
    stopPolling()
    return
  }

  // 기한이 지나 폴링을 멈춘 뒤에도, 돌아온 김에 한 번은 확인한다.
  // 자리를 비운 사이 보호자가 승인했다면 버튼을 누르지 않아도 넘어간다.
  if (phase.value === 'timeout') {
    await checkStatusOnce()
    return
  }

  if (phase.value !== 'waiting') return

  await pollStatus()

  if (phase.value === 'waiting') startPolling()
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

    // 확정하면 서버가 계정을 ACTIVE로 바꾸고 지갑도 만든다. 취소하면 요청이 CANCELED가 된다.
    // 어느 쪽이든 메모리의 로그인 정보가 낡는데, 취소 쪽을 맞추지 않으면 가드가
    // 코드를 다시 입력하러 가는 길에 끝난 요청을 도로 집어든다.
    try {
      await authStore.refresh()
    } catch {
      // 처리는 서버에서 이미 끝나 아이가 다시 시도할 일이 없다.
      // 갱신에 실패해도 화면을 막지 않는다. 홈으로 갈 때 가드가 다시 물어본다.
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
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // 이미 진행 중인 요청이 있으면(재로그인 등) 새로 만들지 않고 그 요청을 이어받는다.
  // 첫 조회를 바로 해야 이미 승인된 요청이 3초를 기다리지 않고 확인 화면으로 넘어간다.
  if (familyConnectStore.requestId) {
    requestId.value = familyConnectStore.requestId
    phase.value = 'waiting'
    startPolling({ renew: true })
    pollStatus()
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
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  stopPolling()
})
</script>

<template>
  <main class="flex min-h-screen flex-col" style="background-color: var(--color-avocado-50)">
    <!-- 헤더 -->
    <SignupHeader @click-back="router.back()" />

    <div class="mx-auto flex w-full max-w-sm flex-col items-center gap-8 px-6 pt-16 pb-12">
      <!-- ── code 유실 (새로고침 등) ── -->
      <template v-if="phase === 'lost'">
        <div
          class="pulse-glow flex h-32 w-32 items-center justify-center rounded-full"
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
          class="pulse-glow flex h-32 w-32 items-center justify-center rounded-full"
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
          class="pulse-glow flex h-32 w-32 items-center justify-center rounded-full"
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
          class="pulse-glow flex h-32 w-32 items-center justify-center rounded-full"
          style="background-color: var(--color-avocado-100)"
        >
          <div
            class="flex h-24 w-24 items-center justify-center rounded-full"
            style="background-color: var(--color-avocado-300)"
          >
            <svg class="hourglass" width="44" height="44" viewBox="0 0 44 44" fill="none">
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
            보호자가 승인 버튼을 누르면<br />아보카도를 시작할 수 있어요.
          </p>
        </div>

        <!--
          코드는 이 화면에 직접 코드를 입력하고 들어왔을 때만 갖고 있다.
          재로그인으로 요청을 이어받은 경우에는 값이 없어 카드째 숨긴다.
        -->
        <div
          v-if="code"
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

        <p class="text-center text-xs leading-relaxed" style="color: var(--color-text-muted)">
          {{ remainingMinutes }}분 동안 확인이 없으면 대기 화면으로 돌아가요
        </p>

        <p
          v-if="cancelError"
          role="alert"
          class="w-full rounded-xl px-3.5 py-2.5 text-sm text-red-700"
          style="background-color: #fef2f2"
        >
          {{ cancelError }}
        </p>

        <button
          type="button"
          class="w-full py-2 text-sm font-medium"
          style="color: var(--color-text-secondary)"
          :disabled="canceling"
          @click="handleCancel"
        >
          {{ canceling ? '취소하는 중...' : '요청 취소하기' }}
        </button>
      </template>

      <!-- ── 대기 시간 초과 (폴링만 멈춤, 요청은 살아 있음) ── -->
      <template v-else-if="phase === 'timeout'">
        <div
          class="pulse-glow flex h-32 w-32 items-center justify-center rounded-full"
          style="background-color: var(--color-avocado-100)"
        >
          <span class="text-4xl">⏰</span>
        </div>

        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
            아직 승인되지 않았어요
          </h1>
          <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
            요청은 그대로 남아 있어요.<br />보호자가 승인하면 이어서 진행할 수 있어요.
          </p>
        </div>

        <p
          v-if="cancelError"
          role="alert"
          class="w-full rounded-xl px-3.5 py-2.5 text-sm text-red-700"
          style="background-color: #fef2f2"
        >
          {{ cancelError }}
        </p>

        <div class="flex w-full flex-col gap-3">
          <BaseButton class="w-full" :disabled="canceling" @click="resumePolling">
            계속 기다리기
          </BaseButton>
          <button
            type="button"
            class="w-full py-2 text-sm font-medium"
            style="color: var(--color-text-secondary)"
            :disabled="canceling"
            @click="handleCancel"
          >
            {{ canceling ? '취소하는 중...' : '요청 취소하기' }}
          </button>
        </div>
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
          class="pulse-glow flex h-32 w-32 items-center justify-center rounded-full"
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
            내 보호자가 맞는지 확인해주세요.
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
            보호자님께 정확한 코드를 받아 다시 시도해주세요.
          </p>
        </div>
        <BaseButton class="w-full" @click="goToCodeInput"> 다시 입력하기 </BaseButton>
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
            이제 보호자와 함께 아보카도를 시작해 볼까요?
          </p>
        </div>

        <BaseButton class="w-full" @click="goHome"> 아보카도 시작하기 </BaseButton>
      </template>
    </div>
  </main>
</template>
<style scoped>
/* 3초마다 한 번 뒤집히는 모래시계 */
.hourglass {
  animation: hourglass-flip 3s ease-in-out infinite;
}

@keyframes hourglass-flip {
  0%,
  60% {
    transform: rotate(0deg);
  }
  80%,
  100% {
    transform: rotate(180deg);
  }
}

/* 기다리는 동안 밝아졌다 어두워지는 배경 */
.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hourglass,
  .pulse-glow {
    animation: none;
  }
}
</style>
