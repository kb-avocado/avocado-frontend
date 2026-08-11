<template>
    <div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div class="flex gap-3">
            <!-- 아이콘 또는 프로필 사진 -->
            <div v-if="avatarUrl" class="w-11 h-11 rounded-full overflow-hidden shrink-0 bg-avocado-100">
                <img :src="avatarUrl" alt="" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-11 h-11 rounded-full flex items-center justify-center shrink-0" :class="iconBgClass">
                <component :is="icon" :size="20" :class="iconColorClass" />
            </div>

            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                    <p class="text-sm font-bold" :class="titleColorClass">
                        {{ title }}
                    </p>
                    <div class="flex items-center gap-1 shrink-0">
                        <span class="text-xs text-muted">{{ time }}</span>
                        <span v-if="unread" class="w-1.5 h-1.5 rounded-full bg-red-500" />
                    </div>
                </div>
                <p class="text-sm text-avocado-900 mt-1 leading-relaxed">
                    {{ message }}
                </p>

                <button v-if="actionLabel" type="button"
                    class="mt-3 bg-avocado-600 text-white text-sm font-semibold rounded-xl px-4 py-2"
                    @click="$emit('click-action')">
                    {{ actionLabel }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

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

defineEmits(['click-action'])

// 위험/경고성 색상
const iconBgClass = computed(() =>
    props.variant === 'danger' ? 'bg-red-50' : 'bg-avocado-100'
)
const iconColorClass = computed(() =>
    props.variant === 'danger' ? 'text-red-500' : 'text-avocado-600'
)
const titleColorClass = computed(() =>
    props.variant === 'danger' ? 'text-red-500' : 'text-avocado-900'
)
</script>