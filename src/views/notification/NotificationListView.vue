<template>
  <div class="min-h-screen flex flex-col bg-surface">
    <AppHeader
      title="알림"
      show-back
      :show-bell="false"
      show-avatar
      @click-back="router.back()"
    />

    <div class="flex-1 p-4 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-avocado-900">알림</h1>
          <p class="text-sm text-muted mt-1">{{ subtitle }}</p>
        </div>

        <!-- 모두 읽음 버튼 -->
        <button
          v-if="unreadCount > 0"
          type="button"
          class="text-xs font-semibold text-avocado-600 hover:text-avocado-700 bg-avocado-50 hover:bg-avocado-100 px-3 py-1.5 rounded-full transition-colors"
          :disabled="isMarkingAllRead"
          @click="handleMarkAllAsRead"
        >
          <span v-if="isMarkingAllRead" class="inline-block animate-spin mr-1">↻</span>
          모두 읽음
        </button>
      </div>

      <!-- 필터 탭 -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="filter in filters"
          :key="filter.value"
          type="button"
          class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
          :class="
            activeFilter === filter.value
              ? 'bg-avocado-600 text-white'
              : 'bg-gray-100 text-muted hover:bg-gray-200'
          "
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- 로딩 중 상태 -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-muted">
        <Loader2 :size="36" class="animate-spin text-avocado-600 mb-3" />
        <p class="text-sm">알림을 불러오고 있어요...</p>
      </div>

      <!-- 에러 상태 -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <AlertCircle :size="40" class="text-red-500 mb-3 opacity-70" />
        <p class="text-sm font-medium text-gray-800">{{ error }}</p>
        <button
          type="button"
          class="mt-4 rounded-full bg-avocado-600 px-4 py-2 text-sm font-semibold text-white hover:bg-avocado-700 transition"
          @click="notificationStore.fetchNotifications()"
        >
          다시 시도
        </button>
      </div>

      <!-- 알림 목록 -->
      <div v-else-if="filteredNotifications.length > 0" class="space-y-3">
        <NotificationCard
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :icon="typeIconMap[notification.type] || Bell"
          :title="notification.title"
          :message="notification.content"
          :time="formatMessageTime(notification.createdAt)"
          :unread="!notification.isRead"
          :variant="notification.variant"
          :action-label="notification.actionLabel"
          @click="handleNotificationClick(notification)"
          @click-action="handleActionClick(notification)"
          @delete="handleDeleteNotification(notification)"
        />
      </div>

      <!-- 빈 상태 -->
      <div v-else class="flex flex-col items-center justify-center py-16 text-muted">
        <BellOff :size="40" class="mb-3 opacity-40" />
        <p class="text-sm font-medium text-gray-600">새로운 알림이 없어요</p>
        <p class="text-xs text-muted mt-1">최근 7일간의 알림만 보여요.</p>
      </div>
    </div>

    <BottomNavBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  Banknote,
  PiggyBank,
  AlertCircle,
  BarChart3,
  BadgeCheck,
  BellOff,
  Bell,
  Loader2,
  MessageCircleHeart,
  Trophy,
  UserRoundPlus
} from 'lucide-vue-next'

import AppHeader from '@/components/common/AppHeader.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import NotificationCard from '@/components/notification/NotificationCard.vue'
import { formatMessageTime } from '@/utils/format'
import { useNotificationStore } from '@/stores/notification'

const route = useRoute()
const router = useRouter()
const notificationStore = useNotificationStore()

const { notifications, unreadCount, loading, error } = storeToRefs(notificationStore)
const isMarkingAllRead = ref(false)

const isParent = computed(() => route.meta.audience === 'parent')

// 아이와 부모 별 소제목
const subtitle = computed(() =>
  isParent.value ? '자녀의 소중한 금융 활동을 확인해보세요.' : '소중한 소식들을 모아봤어요.'
)

// 카테고리 필터
const childFilters = [
  { label: '전체', value: 'ALL' },
  { label: '용돈', value: 'WALLET' },
  { label: '저금', value: 'PIGGY_BANK' },
  { label: '리포트', value: 'REPORT' },
  { label: '가족', value: 'FAMILY' }
]

const parentFilters = [
  { label: '전체', value: 'ALL' },
  { label: '가족', value: 'FAMILY' }
]

const filters = computed(() => (isParent.value ? parentFilters : childFilters))
const activeFilter = ref('ALL')

// 백엔드 알림 type별 아이콘 매핑
const typeIconMap = {
  ALLOWANCE_RECEIVED: Banknote,
  FAMILY_INVITE_RECEIVED: UserRoundPlus,
  FAMILY_RELATION_APPROVED: BadgeCheck,
  SPENDING_REPORT_CREATED: BarChart3,
  CHEER_MESSAGE_RECEIVED: MessageCircleHeart,
  PIGGY_BANK_ACHIEVED: Trophy,
  PIGGY_BANK_BONUS_SET: PiggyBank,
  PIGGY_BANK_REFUNDED: PiggyBank,
  PIGGY_BANK_CREATED: PiggyBank,
  PIGGY_BANK_BONUS_REMINDER: PiggyBank,
  WALLET: Banknote,
  PIGGY_BANK: PiggyBank,
  NEWS: BarChart3,
  SYSTEM: BarChart3
}

// 필터링된 알림 목록
const filteredNotifications = computed(() => {
  if (activeFilter.value === 'ALL') return notifications.value
  return notifications.value.filter((n) => n.category === activeFilter.value)
})

// 단건 알림 클릭 시 읽음 처리 및 이동
async function handleNotificationClick(notification) {
  if (!notification.isRead) {
    try {
      await notificationStore.markAsRead(notification.id)
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err)
    }
  }

  // 액션 버튼이 있는 알림이면 해당 액션으로 연결
  if (notification.actionLabel) {
    handleActionClick(notification)
    return
  }

  // 새 알림 DTO에는 상세 ID가 없으므로 타입별 접근 가능한 대표 화면으로 이동한다.
  if (notification.type === 'ALLOWANCE_RECEIVED') {
    router.push({ name: 'wallet' })
  } else if (notification.type === 'FAMILY_RELATION_APPROVED') {
    router.push({ name: 'home' })
  } else if (notification.type === 'FAMILY_INVITE_RECEIVED') {
    if (isParent.value) {
      router.push({ name: 'mypageParent' })
    }
  } else if (notification.type === 'SPENDING_REPORT_CREATED') {
    router.push({ name: isParent.value ? 'parent-report' : 'child-report' })
  } else if (notification.notifyType === 'PIGGY_BANK') {
    // 부모용 저금통 상세는 childId가 필요한데 알림에는 담겨오지 않아 목록으로 이동한다.
    if (isParent.value) {
      router.push({ name: 'parent-piggy-list' })
    } else {
      if (notification.referenceId) {
        router.push({ name: 'piggyChildDetail', params: { id: notification.referenceId } })
      } else {
        router.push({ name: 'piggy' })
      }
    }
  } else if (notification.notifyType === 'WALLET') {
    if (isParent.value) {
      router.push({ name: 'parent-home' })
    } else {
      router.push({ name: 'wallet' })
    }
  } else if (notification.notifyType === 'NEWS') {
    if (notification.referenceId) {
      router.push({
        name: isParent.value ? 'parent-newspaper-detail' : 'newspaper-detail',
        params: { newsId: notification.referenceId }
      })
    } else {
      router.push({ name: isParent.value ? 'parent-newspaper' : 'newspaper' })
    }
  }
}

// 액션 버튼 클릭
async function handleActionClick(notification) {
  if (!notification.isRead) {
    try {
      await notificationStore.markAsRead(notification.id)
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err)
    }
  }

  if (notification.notifyType === 'PIGGY_BANK' && notification.referenceId) {
    if (isParent.value) {
      router.push({ name: 'piggyBonus', params: { id: notification.referenceId } })
    } else {
      router.push({ name: 'piggyChildDetail', params: { id: notification.referenceId } })
    }
  }
}

// 알림 삭제
async function handleDeleteNotification(notification) {
  try {
    await notificationStore.removeNotification(notification.id)
  } catch (err) {
    alert('알림 삭제에 실패했습니다. 다시 시도해 주세요.')
  }
}

// 전체 읽음 처리
async function handleMarkAllAsRead() {
  if (isMarkingAllRead.value || unreadCount.value === 0) return

  isMarkingAllRead.value = true
  try {
    await notificationStore.markAllAsRead()
  } catch (err) {
    alert('전체 읽음 처리에 실패했습니다. 다시 시도해 주세요.')
  } finally {
    isMarkingAllRead.value = false
  }
}

onMounted(() => {
  notificationStore.fetchNotifications()
})
</script>
