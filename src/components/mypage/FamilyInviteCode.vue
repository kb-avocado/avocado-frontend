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
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { Share2, Copy } from 'lucide-vue-next'

const props = defineProps({
  inviteCode: { type: String, required: true } // 예: 'AB-1234-CD'
})

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
