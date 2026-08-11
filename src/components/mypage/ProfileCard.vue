<template>
  <section class="rounded-2xl bg-white p-5 shadow-sm">
    <div class="flex items-center gap-4">
      <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-avocado-100">
        <User :size="26" class="text-avocado-600" />
      </div>

      <div class="min-w-0">
        <p class="truncate text-lg font-bold text-gray-900">{{ name }}</p>
        <p class="text-sm text-muted">{{ userType }}</p>
        <p class="truncate text-sm text-muted">{{ email }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { User } from 'lucide-vue-next'

defineProps({
  name: { type: String, required: true },
  userType: { type: String, required: true }, // '보호자' | '아이'
  email: { type: String, required: true }
})
</script>
