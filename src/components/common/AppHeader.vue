<template>
  <header
    class="relative flex items-center justify-between h-16 px-4 bg-white border-b border-gray-100"
  >
    <div class="flex items-center w-8">
      <button
        v-if="showBack"
        type="button"
        class="p-1 -ml-1 text-avocado-600"
        aria-label="뒤로 가기"
        @click="$emit('click-back')"
      >
        <ChevronLeft :size="22" />
      </button>
    </div>

    <h1
      class="absolute left-1/2 -translate-x-1/2 text-[17px] font-medium text-gray-900 truncate max-w-[62%] text-center"
    >
      {{ title }}
    </h1>

    <div class="flex items-center gap-3 shrink-0">
      <button
        v-if="showBell"
        type="button"
        class="text-avocado-900"
        aria-label="알림"
        @click="$emit('click-bell')"
      >
        <Bell :size="20" />
      </button>
      <button
        v-if="showAvatar"
        type="button"
        class="w-8 h-8 rounded-full bg-avocado-100 flex items-center justify-center overflow-hidden"
        aria-label="내 프로필"
        @click="$emit('click-avatar')"
      >
        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          alt=""
          class="w-full h-full object-cover"
        />
        <User v-else :size="16" class="text-avocado-600" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { Bell, User, ChevronLeft } from 'lucide-vue-next'

defineProps({
  title: { type: String, required: true },
  showBack: { type: Boolean, default: false },
  showBell: { type: Boolean, default: true },
  showAvatar: { type: Boolean, default: true },
  avatarUrl: { type: String, default: '' },
})

defineEmits(['click-back', 'click-bell', 'click-avatar'])
</script>