<!-- App.vue -->
<template>
  <div class="min-h-screen bg-gray-100 flex justify-center">
    <div class="w-full max-w-[430px] min-h-screen bg-white flex flex-col shadow-xl">
      <AppHeader v-if="!route.meta.hideLayout" :title="pageTitle" />
      <main class="flex-1 overflow-y-auto">
        <RouterView />
      </main>
      <BottomNavBar v-if="!route.meta.hideLayout" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import BottomNavBar from '@/components/layout/BottomNavBar.vue'

const route = useRoute()
const pageTitle = computed(() => route.meta.title ?? '아보카도')
</script>