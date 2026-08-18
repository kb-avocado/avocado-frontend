<template>
  <div class="min-h-screen bg-gray-100 flex justify-center">
    <div class="w-full max-w-[430px] h-screen bg-white flex flex-col shadow-xl overflow-hidden">
      <AppHeader
        v-if="!route.meta.hideLayout"
        :title="pageTitle"
        :show-back="showBack"
        @click-back="goBack"
        @click-avatar="goMyPage"
        @click-bell="goNotifications"
      />

      <main class="flex-1 min-h-0 overflow-y-auto">
        <RouterView />
      </main>

      <BottomNavBar v-if="!route.meta.hideLayout" />
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import { pageTitleOverride } from '@/composables/usePageTitle'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const pageTitle = computed(() => pageTitleOverride.value ?? route.meta.title ?? '아보카도')
const showBack = computed(() => route.meta.showBack === true)

function goBack() {
  if (window.history.state?.back) {
    router.back()
    return
  }

  if (route.meta.audience === 'parent' && route.params.childId) {
    router.replace({
      name: 'parent-piggy-list',
      params: {
        childId: route.params.childId
      }
    })
    return
  }

  router.replace({
    name: 'piggy'
  })
}

function goMyPage() {
  router.push({
    name: authStore.user?.type === 'CHILD' ? 'mypageChild' : 'mypageParent'
  })
}

function goNotifications() {
  router.push({
    name: authStore.user?.type === 'PARENT' ? 'parentNotifications' : 'childNotifications'
  })
}

// 로그인 상태 변경 시 미읽음 알림 개수 조회 및 SSE 구독 생명주기 관리
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth) {
      notificationStore.fetchUnreadCount()
      notificationStore.subscribeSse()
    } else {
      notificationStore.unsubscribeSse()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  notificationStore.unsubscribeSse()
})
</script>
