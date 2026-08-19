<template>
  <section class="rounded-2xl bg-avocado-100 p-5">
    <p class="flex items-center gap-2 text-sm font-bold text-gray-900">
      <Share2 :size="16" class="text-avocado-600" />
      자녀 연결 코드
    </p>

    <div class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
      <span class="invite-code truncate text-xl font-semibold tracking-widest text-gray-900">
        {{ inviteCode }}
      </span>

      <button
        type="button"
        class="flex shrink-0 items-center gap-1 rounded-lg bg-avocado-600 px-3 py-2 text-xs font-medium text-white"
        @click="copyCode"
      >
        <Copy :size="14" />
        {{ copied ? '복사됨' : '코드 복사' }}
      </button>
    </div>

    <p class="mt-3 text-xs text-muted">자녀의 앱에서 이 코드를 입력하여 연결하세요.</p>

    <!--
      코드를 주는 것과 받은 요청을 처리하는 것은 한 흐름이라 같은 카드에 둔다.
      요청함으로 들어가는 길은 여기 하나뿐이라 대기 건수가 0이어도 감추지 않는다.
    -->
    <button
      type="button"
      class="mt-3 flex w-full items-center gap-2 border-t border-avocado-300 pt-3 text-left"
      @click="goToRequests"
    >
      <span class="flex-1 truncate text-xs font-semibold text-gray-900">받은 연결 요청</span>
      <span
        v-if="pendingCount > 0"
        class="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white"
      >
        {{ pendingCount > 99 ? '99+' : pendingCount }}
      </span>
      <ChevronRight :size="14" class="text-muted" />
    </button>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Share2, Copy, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  inviteCode: { type: String, required: true }, // 예: 'AB-1234-CD'
  // 승인을 기다리는 요청 수. 0이면 뱃지 없이 줄만 보여준다.
  pendingCount: { type: Number, default: 0 }
})

const router = useRouter()

function goToRequests() {
  router.push({ name: 'family-requests' })
}

const copied = ref(false)

async function copyCode() {
  await navigator.clipboard.writeText(props.inviteCode)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@600&display=swap');

.invite-code {
  font-family: 'Source Code Pro', monospace;
}
</style>
