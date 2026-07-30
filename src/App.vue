<template>
  <div class="min-h-screen bg-gray-100 flex justify-center">
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
const route = useRoute()
const router = useRouter()
const pageTitle = computed(() => route.meta.title ?? '아보카도')

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
</script>
