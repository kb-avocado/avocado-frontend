<template>
  <div class="min-h-screen bg-gray-100 flex justify-center">
    <!-- TODO: 개발용 임시 로그아웃 버튼. 정식 로그아웃 UI가 생기면 제거한다. -->
    <button
      type="button"
      class="fixed left-4 top-4 z-50 rounded-lg bg-gray-800/80 px-3 py-1.5 text-xs font-medium text-white shadow"
      @click="handleDevLogout"
    >
      로그아웃(임시)
    </button>
    <!-- 여기까지 지우기(1) -->

    <div class="w-full max-w-[430px] h-screen bg-white flex flex-col shadow-xl overflow-hidden">
      <AppHeader
        v-if="!route.meta.hideLayout"
        :title="pageTitle"
        :show-back="showBack"
        @click-back="goBack"
      />

      <main class="flex-1 min-h-0 overflow-y-auto">
        <RouterView />
      </main>

      <BottomNavBar v-if="!route.meta.hideLayout" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import { pageTitleOverride } from '@/composables/usePageTitle'
import { logout } from '@/api/auth' // TODO: 임시 로그아웃
import { useAuthStore } from '@/stores/auth' // TODO: 임시 로그아웃
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore() // TODO: 임시 로그아웃
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

// TODO: 개발용 임시 로그아웃. 정식 로그아웃 UI가 생기면 제거한다.
async function handleDevLogout() {
  try {
    await logout()
  } catch {
    // 토큰이 이미 만료돼 실패해도 화면 상태는 초기화한다
  } finally {
    authStore.clear()
    router.push({ name: 'login' })
  }
}
// 여기까지 지우기(2)
</script>
