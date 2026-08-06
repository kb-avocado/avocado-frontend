<template>
  <div class="min-h-screen flex flex-col bg-white">
    <AppHeader
      :title="route.meta.title"
      show-back
      :show-bell="false"
      :show-avatar="false"
      @click-back="router.back()"
    />

    <div class="flex-1 p-4 space-y-3">
      <p class="text-sm font-medium text-avocado-900">응원 메시지 ({{ messages.length }})</p>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="relative flex gap-3 bg-avocado-100 rounded-2xl p-4"
        :class="route.meta.cheerDeletable ? 'pr-10' : ''"
      >
        <div class="w-9 h-9 rounded-full bg-avocado-300 flex items-center justify-center shrink-0">
          <UserRound :size="18" class="text-white" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-avocado-900">{{ msg.senderName }}</p>
            <p class="text-xs text-muted">{{ formatMessageTime(msg.createdAt) }}</p>
          </div>
          <p class="text-sm text-avocado-900 mt-1 leading-relaxed">{{ msg.message }}</p>
        </div>

        <button
          v-if="route.meta.cheerDeletable"
          type="button"
          class="absolute top-3 right-3 text-muted hover:text-red-500"
          @click="handleDelete(msg.id)"
        >
          <Trash2 :size="16" />
        </button>
      </div>

      <p v-if="messages.length === 0" class="text-sm text-muted text-center mt-10">
        아직 도착한 응원 메시지가 없어요.
      </p>
    </div>

    <BottomNavBar />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserRound, Trash2 } from 'lucide-vue-next'

/* 뒤로가기 버튼 활성화를 위한 헤더와 NAV import */
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'

import { getCheerMessages, deleteCheerMessage } from '@/api/piggy'
import { formatMessageTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const messages = ref([])

async function fetchMessages() {
  try {
    const response = await getCheerMessages(route.params.id)

    messages.value = response.data.data.map((m) => ({
      id: m.cheerMessageId,
      senderName: m.senderName,
      message: m.message,
      createdAt: m.createdAt
    }))
  } catch (e) {
    messages.value = []
  }
}

onMounted(fetchMessages)

async function handleDelete(messageId) {
  // 추후 삭제 확인 공통 모달 제작 후 바꿔지기 예정
  if (!window.confirm('이 응원 메시지를 삭제할까요?')) return
  try {
    // piggy.js의 응원 삭제 api 호출
    await deleteCheerMessage(route.params.id, messageId)

    // db에서 삭제되면 화면에도 갱신
    messages.value = messages.value.filter((m) => m.id !== messageId)
  } catch (e) {
    alert('삭제에 실패했어요. 다시 시도해주세요.')
  }
}
</script>
