<template>
  <div class="h-screen overflow-hidden flex flex-col bg-white">
    <AppHeader :title="route.meta.title" show-back :show-bell="false" :show-avatar="false"
      @click-back="router.back()" />

    <div class="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
      <p class="text-sm font-medium text-avocado-900">응원 메시지 ({{ messages.length }})</p>

  <div v-for="(msg, index) in messages" :key="msg.id" class="relative flex gap-3 rounded-2xl p-4 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)]"
        :style="{ backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }"
        :class="route.meta.cheerDeletable ? 'mr-8' : ''">
        <div class="w-9 h-9 rounded-full bg-white overflow-hidden shrink-0 grid place-items-center">
          <img :src="parentAvatar" alt="" class="w-full h-full object-contain" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <p class="text-xs text-muted">{{ formatMessageTime(msg.createdAt) }}</p>
          </div>
          <p class="text-sm text-avocado-900 mt-1 leading-relaxed">{{ msg.message }}</p>
        </div>

        <button v-if="route.meta.cheerDeletable" type="button"
          class="absolute top-10 -right-8" style="color: #000000" @click="handleDelete(msg.id)">
          <Trash2 :size="16" />
        </button>
      </div>

      <p v-if="messages.length === 0" class="text-sm text-muted text-center mt-10">
        아직 도착한 응원 메시지가 없어요.
      </p>
    </div>

    <BottomNavBar />

    <ConfirmModal v-model="showDeleteConfirm" variant="delete" title="이 응원 메시지를 삭제할까요?" @confirm="confirmDelete" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Trash2 } from 'lucide-vue-next'

/* 뒤로가기 버튼 활성화를 위한 헤더와 NAV import */
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

import parentAvatar from '@/assets/images/parent.png'
import { getCheerMessages, deleteCheerMessage } from '@/api/piggy'
import { formatMessageTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const messages = ref([])
// 응원 메시지 카드 배경색: 순서대로 세 가지 색을 반복
const CARD_COLORS = ['#FFF6F6', '#F1F6FF', '#FFFEEF']
async function fetchMessages() {
  try {
    const response = await getCheerMessages(route.params.id, route.params.childId)

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

const showDeleteConfirm = ref(false)
const pendingDeleteId = ref(null)

function handleDelete(messageId) {
  pendingDeleteId.value = messageId
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  const messageId = pendingDeleteId.value
  if (messageId == null) return

  try {
    // piggy.js의 응원 삭제 api 호출
    await deleteCheerMessage(route.params.id, messageId)

    // db에서 삭제되면 화면에도 갱신
    messages.value = messages.value.filter((m) => m.id !== messageId)
  } catch (e) {
    alert('삭제에 실패했어요. 다시 시도해주세요.')
  } finally {
    pendingDeleteId.value = null
  }
}
</script>