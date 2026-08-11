<template>
  <section class="rounded-2xl bg-avocado-100 p-5">
    <p class="flex items-center gap-2 text-sm font-bold text-gray-900">
      <Users :size="16" class="text-avocado-600" />
      연결된 보호자
    </p>

    <div class="mt-3 flex items-center gap-3 rounded-xl bg-white px-4 py-3">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-avocado-100">
        <User :size="18" class="text-avocado-600" />
      </div>

      <div class="min-w-0">
        <p class="truncate text-sm font-bold text-gray-900">{{ parentName }}</p>
        <p class="truncate text-xs text-muted">{{ parentEmail }}</p>
      </div>
    </div>

    <p class="mt-3 text-xs text-muted">보호자와 연결되어 용돈과 저금통을 함께 관리하고 있어요.</p>
  </section>
</template>

<script setup>
import { Users, User } from 'lucide-vue-next'

defineProps({
  parentName: { type: String, required: true },
  parentEmail: { type: String, required: true }
})
</script>
