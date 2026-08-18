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
        class="relative p-1 text-avocado-900 hover:text-avocado-700 transition-colors"
        aria-label="알림"
        @click="$emit('click-bell')"
      >
        <Bell :size="20" />
        <!-- 미읽음 알림 배지 -->
        <span
          v-if="displayUnreadCount > 0"
          class="absolute top-0 right-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none ring-2 ring-white shadow-sm"
        >
          {{ displayUnreadCount > 99 ? '99+' : displayUnreadCount }}
        </span>
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
import { computed } from 'vue'
import { Bell, User, ChevronLeft } from 'lucide-vue-next'
import { useNotificationStore } from '@/stores/notification'

const props = defineProps({
  title: { type: String, required: true },
  showBack: { type: Boolean, default: false },
  showBell: { type: Boolean, default: true },
  showAvatar: { type: Boolean, default: true },
  avatarUrl: { type: String, default: '' },
  unreadCount: { type: Number, default: null }
})

defineEmits(['click-back', 'click-bell', 'click-avatar'])

const notificationStore = useNotificationStore()

const displayUnreadCount = computed(() => {
  if (props.unreadCount !== null) {
    return props.unreadCount
  }
  return notificationStore.unreadCount
})
</script>