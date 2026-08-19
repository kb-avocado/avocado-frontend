<template>
  <button
    type="button"
    class="mx-auto flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700"
    @click="handleLogout"
  >
    <LogOut :size="16" />
    로그아웃
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'
import { logout } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

async function handleLogout() {
  if (!window.confirm('로그아웃 하시겠습니까?')) return
  notificationStore.reset()

  try {
    await logout()
  } catch {
    // 토큰이 이미 만료돼 실패해도 화면 상태는 초기화한다
  } finally {
    authStore.clear()
    router.push({ name: 'login' })
  }
}
</script>
