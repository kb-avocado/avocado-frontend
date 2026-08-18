<template>
  <div
    class="relative rounded-2xl border transition-all p-4 shadow-sm cursor-pointer select-none"
    :class="[
      unread
        ? 'border-avocado-200 bg-white shadow-sm'
        : 'border-gray-100 bg-gray-50/70 text-gray-500'
    ]"
    role="button"
    tabindex="0"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <div class="flex gap-3">
      <!-- 아이콘 또는 프로필 사진 -->
      <div
        v-if="avatarUrl"
        class="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-avocado-100"
      >
        <img :src="avatarUrl" alt="" class="w-full h-full object-cover" />
      </div>
      <div
        v-else
        class="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
        :class="iconBgClass"
      >
        <component :is="icon" :size="20" :class="iconColorClass" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold truncate" :class="titleColorClass">
            {{ title }}
          </p>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-xs text-muted">{{ time }}</span>
            <span
              v-if="unread"
              class="w-2 h-2 rounded-full bg-red-500"
              aria-label="읽지 않은 알림"
            />
            <!-- 삭제 버튼 -->
            <button
              type="button"
              class="ml-1 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="알림 삭제"
              @click.stop="$emit('delete')"
            >
              <Trash2 :size="15" />
            </button>
          </div>
        </div>

        <p
          class="text-sm mt-1 leading-relaxed"
          :class="unread ? 'text-avocado-900' : 'text-gray-600'"
        >
          {{ message }}
        </p>

        <button
          v-if="actionLabel"
          type="button"
          class="mt-3 bg-avocado-600 hover:bg-avocado-700 active:scale-95 text-white text-sm font-semibold rounded-xl px-4 py-2 transition-transform"
          @click.stop="$emit('click-action')"
        >
          {{ actionLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'

const props = defineProps({
  icon: { type: [Object, Function], default: null },
  avatarUrl: { type: String, default: '' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: String, required: true },
  unread: { type: Boolean, default: false },
  // 기본 알림은 avocado 색상, 위험/경고성 알림(고액결제 등)은 danger
  variant: { type: String, default: 'default' },
  actionLabel: { type: String, default: '' }
})

defineEmits(['click', 'click-action', 'delete'])

// 위험/경고성 색상
const iconBgClass = computed(() =>
  props.variant === 'danger' ? 'bg-red-50' : 'bg-avocado-100'
)
const iconColorClass = computed(() =>
  props.variant === 'danger' ? 'text-red-500' : 'text-avocado-600'
)
const titleColorClass = computed(() => {
  if (props.variant === 'danger') return 'text-red-500'
  return props.unread ? 'text-avocado-900' : 'text-gray-700'
})
</script>