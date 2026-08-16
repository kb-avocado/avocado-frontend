<template>
    <div class="min-h-screen flex flex-col bg-surface">
        <AppHeader title="알림" show-back :show-bell="false" show-avatar @click-back="router.back()" />

        <div class="flex-1 p-4 space-y-4">
            <div>
                <h1 class="text-2xl font-bold text-avocado-900">알림</h1>
                <p class="text-sm text-muted mt-1">{{ subtitle }}</p>
            </div>

            <!-- 필터 탭 -->
            <div class="flex gap-2 overflow-x-auto pb-1">
                <button v-for="filter in filters" :key="filter.value" type="button"
                    class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold" :class="activeFilter === filter.value
                        ? 'bg-avocado-600 text-white'
                        : 'bg-gray-100 text-muted'
                        " @click="activeFilter = filter.value">
                    {{ filter.label }}
                </button>
            </div>

            <!-- 알림 목록 -->
            <div v-if="filteredNotifications.length > 0" class="space-y-3">
                <NotificationCard v-for="notification in filteredNotifications" :key="notification.id"
                    :icon="typeIconMap[notification.notifyType]" :title="notification.title"
                    :message="notification.content" :time="formatMessageTime(notification.createdAt)"
                    :unread="!notification.isRead" :variant="notification.variant"
                    :action-label="notification.actionLabel" @click-action="handleAction(notification)" />
            </div>

            <!-- 빈 상태 -->
            <div class="flex flex-col items-center justify-center py-16 text-muted">
                <BellOff :size="40" class="mb-3 opacity-40" />
                <p class="text-sm">최근 30일간의 알림만 보여요.</p>
            </div>
        </div>

        <BottomNavBar />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingBag, PiggyBank, AlertTriangle, BarChart3, BellOff } from 'lucide-vue-next'

import AppHeader from '@/components/common/AppHeader.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import NotificationCard from '@/components/notification/NotificationCard.vue'
import { formatMessageTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const isParent = computed(() => route.meta.audience === 'parent')

// 아이와 부모 별 소제목
const subtitle = computed(() =>
    isParent.value ? '자녀의 소중한 금융 활동을 확인해보세요.' : '소중한 소식들을 모아봤어요.'
)

// 현재 와이어프레임 상 카테고리로 분류, 나중에 도메인 별로 수정할 듯
// 아이
const childFilters = [
    { label: '전체', value: 'ALL' },
    { label: '결제', value: 'WALLET' },
    { label: '용돈', value: 'WALLET' },
    { label: '저금', value: 'PIGGY_BANK' }
]
//부모
const parentFilters = [
    { label: '전체', value: 'ALL' },
    { label: '결제', value: 'WALLET' },
    { label: '저금', value: 'PIGGY_BANK' },
    { label: '활동', value: 'SYSTEM' }
]

const filters = computed(() => (isParent.value ? parentFilters : childFilters))

// 기본값은 ALL
const activeFilter = ref('ALL')

// notify_type별 아이콘/스타일 매핑 (실제 알림 API 붙으면 이 매핑 로직만 그대로 재사용 가능)
const typeIconMap = {
    WALLET: ShoppingBag,
    PIGGY_BANK: PiggyBank,
    NEWS: BarChart3,
    SYSTEM: BarChart3
}

// TODO: 알림 API 준비되면 실제 데이터로 교체. 필드명은 notifications 테이블 컬럼에 일단 맞춰놓음
// 아이 테스트 데이터
const childNotifications = [
    {
        id: 1,
        userId: 102,
        notifyType: 'WALLET',
        title: 'CU 편의점',
        content: '3,500원이 결제되었어요. 잔액은 12,400원이에요.',
        isRead: false,
        referenceId: null,
        createdAt: '2026-08-11T14:20:00'
    },
    {
        id: 2,
        userId: 102,
        notifyType: 'WALLET',
        title: 'Roblox Payment',
        content: '5,000원이 성공적으로 결제되었습니다.',
        isRead: true,
        referenceId: null,
        createdAt: '2026-08-11T10:20:00'
    },
    {
        id: 3,
        userId: 102,
        notifyType: 'PIGGY_BANK',
        title: '저금 리마인드',
        content: "'닌텐도 스위치 사기' 목표까지 5,000원 남았어요! 오늘 조금 더 모아볼까요?",
        isRead: true,
        referenceId: 4001,
        createdAt: '2026-08-10T09:00:00'
    }
]
// 부모 테스트 데이터
const parentNotifications = [
    {
        id: 1,
        userId: 101,
        notifyType: 'SYSTEM',
        title: '연결 완료',
        content: '[연결 완료] 김아보 님과 연결되었습니다.',
        isRead: true,
        referenceId: null,
        createdAt: '2026-08-11T14:25:00'
    },
    {
        id: 2,
        userId: 101,
        notifyType: 'WALLET',
        title: '고액 결제 알림',
        content: "김아보 님이 '닌텐도 스토어'에서 55,000원을 결제했습니다.",
        isRead: false,
        referenceId: null,
        createdAt: '2026-08-11T14:15:00',
        variant: 'danger'
    },
    {
        id: 3,
        userId: 101,
        notifyType: 'PIGGY_BANK',
        title: '저금 시작',
        content: "김아보 님이 '레고 모으기' 목표를 새로 등록했습니다. 응원 보너스를 설정해볼까요?",
        isRead: true,
        referenceId: 1,
        createdAt: '2026-08-11T13:25:00',
        actionLabel: '응원 보너스 설정'
    },
    {
        id: 4,
        userId: 101,
        notifyType: 'SYSTEM',
        title: '소비 분석',
        content: '지난주 김아보 님의 소비 리포트가 도착했습니다.',
        isRead: true,
        referenceId: null,
        createdAt: '2026-08-11T09:00:00'
    }
]

const notifications = computed(() => (isParent.value ? parentNotifications : childNotifications))

const filteredNotifications = computed(() => {
    if (activeFilter.value === 'ALL') return notifications.value
    return notifications.value.filter((n) => n.notifyType === activeFilter.value)
})

function handleAction(notification) {
    if (notification.referenceId) {
        router.push({ name: 'piggyBonus', params: { id: notification.referenceId } })
    }
}
</script>