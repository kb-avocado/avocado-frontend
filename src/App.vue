<script setup>
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <div id="app-wrapper" class="min-h-screen bg-gray-50">
    <AppHeader />
    <main class="mx-auto max-w-screen-md p-4">
      <RouterView />
    </main>
  </div>
</template>
