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

      <main class="relative flex-1 min-h-0 overflow-y-auto">
        <RouterView v-slot="{ Component }">
          <Transition :name="pageTransitionName">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>

      <BottomNavBar v-if="!route.meta.hideLayout" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import { pageTitleOverride } from '@/composables/usePageTitle'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const SLIDE_UP_ROUTE_NAMES = ['childNotifications', 'parentNotifications']

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const pageTitle = computed(() => pageTitleOverride.value ?? route.meta.title ?? '아보카도')
const showBack = computed(() => route.meta.showBack === true)

// 알림 페이지처럼 아래에서 슬라이드로 나타나는 라우트는 진입/이탈 방향에 따라
// 다른 트랜지션 이름을 써서, 들어올 땐 위로 올라오고 뒤로 갈 땐 아래로 내려가게 한다.
const pageTransitionName = ref('')

router.beforeEach((to, from) => {
  if (SLIDE_UP_ROUTE_NAMES.includes(to.name)) {
    pageTransitionName.value = 'slide-up'
  } else if (SLIDE_UP_ROUTE_NAMES.includes(from.name)) {
    pageTransitionName.value = 'slide-down'
  } else {
    pageTransitionName.value = ''
  }
})

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

// 계정 상태 변경 시 미읽음 알림 개수 조회 및 SSE 구독 생명주기 관리
watch(
  () => authStore.user?.status,
  (status) => {
    notificationStore.sync(authStore.user)

    if (status === 'ACTIVE') {
      notificationStore.fetchUnreadCount()
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  notificationStore.unsubscribeSse()
})
</script>

<style>
.slide-up-enter-active,
.slide-down-leave-active {
  position: absolute;
  inset: 0;
  z-index: 50;
}
.slide-up-enter-active {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-down-leave-active {
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}
.slide-up-enter-from {
  transform: translateY(100%);
}
.slide-down-leave-to {
  transform: translateY(100%);
}
</style>
