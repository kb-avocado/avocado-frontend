<template>
  <div class="min-h-screen bg-gray-100 flex justify-center">
    <div class="w-full max-w-[430px] h-screen bg-white flex flex-col shadow-xl overflow-hidden">
      <AppHeader
        v-if="!route.meta.hideLayout"
        :title="pageTitle"
        :show-back="showBack"
        :show-bell="showHeaderIcons"
        :show-avatar="showHeaderIcons"
        @click-back="goBack"
        @click-avatar="goMyPage"
        @click-bell="goNotifications"
      />

      <main class="relative flex-1 min-h-0 overflow-hidden">
        <RouterView v-slot="{ Component }">
          <Transition :name="pageTransitionName">
            <div :key="pageKey" class="absolute inset-0 overflow-y-auto bg-white">
              <component :is="Component" />
            </div>
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

// 알림/마이페이지/결제하기(아이)/용돈 보내기(부모)처럼 아래에서 슬라이드로 나타나는 라우트는
// 진입/이탈 방향에 따라 다른 트랜지션 이름을 써서, 들어올 땐 위로 올라오고 뒤로 갈 땐 아래로 내려가게 한다.
const SLIDE_UP_ROUTE_NAMES = [
  'childNotifications',
  'parentNotifications',
  'mypageChild',
  'mypageParent',
  'wallet',
  'parent-transfer'
]

// 마이페이지 화면에서는 헤더의 알림/프로필 아이콘을 숨긴다(이미 그 화면에 들어와 있으므로).
const HIDE_HEADER_ICONS_ROUTE_NAMES = ['mypageChild', 'mypageParent']

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const pageTitle = computed(() => pageTitleOverride.value ?? route.meta.title ?? '아보카도')
const showBack = computed(() => route.meta.showBack === true)
const showHeaderIcons = computed(() => !HIDE_HEADER_ICONS_ROUTE_NAMES.includes(route.name))

const pageTransitionName = ref('fade')

// 부모 홈은 아이 전환 시 childId만 바뀌고 화면은 그대로 유지되길 기대하며
// (HomeView.vue의 childId watcher 참고) 컴포넌트 자체를 유지해야 한다.
// route.fullPath를 키로 쓰면 childId가 바뀔 때마다 화면 전체가 다시 마운트되어
// 로딩 상태가 초기화되면서 오류 화면이 잠깐 보이는 문제가 있었다.
// 저금통 목록(아이/부모)도 상태 탭(진행중/보너스 대기중/완료)을 쿼리스트링에 반영해
// (PiggyView.vue, ParentPiggyBankListView.vue 참고) 같은 이유로 탭을 누를 때마다
// route.fullPath가 바뀌어 화면 전체가 재마운트되는 문제가 있어 함께 추가한다.
const REUSE_ON_PARAM_CHANGE_ROUTE_NAMES = ['parent-home', 'piggy', 'parent-piggy-list']

const pageKey = computed(() =>
  REUSE_ON_PARAM_CHANGE_ROUTE_NAMES.includes(route.name) ? route.name : route.fullPath
)

router.beforeEach((to, from) => {
  if (SLIDE_UP_ROUTE_NAMES.includes(to.name)) {
    pageTransitionName.value = 'slide-up'
  } else if (SLIDE_UP_ROUTE_NAMES.includes(from.name)) {
    pageTransitionName.value = 'slide-down'
  } else {
    pageTransitionName.value = 'fade'
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-page) ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-down-leave-active {
  z-index: 50;
}
.slide-up-enter-active {
  transition: transform 0.32s var(--ease-sheet);
}
.slide-down-leave-active {
  transition: transform 0.4s var(--ease-sheet);
}
.slide-up-enter-from {
  transform: translateY(100%);
}
.slide-down-leave-to {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .slide-up-enter-active,
  .slide-down-leave-active {
    transition: none;
  }
}
</style>