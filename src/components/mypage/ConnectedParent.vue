<template>
  <section class="rounded-2xl bg-avocado-100 p-5">
    <p class="flex items-center gap-2 text-sm font-bold text-gray-900">
      <Users :size="16" class="text-avocado-600" />
      나의 보호자
    </p>

    <div class="mt-3 flex items-center gap-3 rounded-xl bg-white px-4 py-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white"
      >
        <img :src="parentImage" alt="보호자" class="h-full w-full object-contain" />
      </div>

      <div class="min-w-0">
        <p class="truncate text-sm font-bold text-gray-900">{{ parentName }}</p>
        <p class="truncate text-xs text-muted">{{ parentEmail }}</p>
      </div>
    </div>

      </section>
</template>

<script setup>
import { Users } from 'lucide-vue-next'
import parentImage from '@/assets/images/parent.png'

defineProps({
  parentName: { type: String, required: true },
  parentEmail: { type: String, required: true }
})
</script>