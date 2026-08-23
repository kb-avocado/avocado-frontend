<template>
  <div class="h-screen overflow-hidden flex flex-col bg-surface">
    <AppHeader
      title="알림"
      show-back
      :show-bell="false"
      :show-avatar="false"
      @click-back="router.back()"
    />

    <div
      class="flex-1 min-h-0 overflow-y-auto space-y-4 p-4 pb-[calc(var(--nav-height)+1rem)]"
    >
      <!-- 제목 -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-avocado-900">
            알림
          </h1>

          <p class="text-sm text-muted mt-1">
            {{ subtitle }}
          </p>
        </div>

        <!-- 모두 읽음 -->
        <button
          v-if="unreadCount > 0"
          type="button"
          class="text-xs font-semibold text-avocado-600 hover:text-avocado-700 bg-avocado-50 hover:bg-avocado-100 px-3 py-1.5 rounded-full transition-colors"
          :disabled="isMarkingAllRead"
          @click="handleMarkAllAsRead"
        >
          <span
            v-if="isMarkingAllRead"
            class="inline-block animate-spin mr-1"
          >
            ↻
          </span>

          모두 읽음
        </button>
      </div>

      <!-- 필터 -->
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
          @click="changeFilter(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- 로딩 -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-16 text-muted"
      >
        <Loader2
          :size="36"
          class="animate-spin text-avocado-600 mb-3"
        />

        <p class="text-sm">
          알림을 불러오고 있어요...
        </p>
      </div>

      <!-- 에러 -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-16 text-center"
      >
        <AlertCircle
          :size="40"
          class="text-red-500 mb-3 opacity-70"
        />

        <p class="text-sm font-medium text-gray-800">
          {{ error }}
        </p>

        <button
          type="button"
          class="mt-4 rounded-full bg-avocado-600 px-4 py-2 text-sm font-semibold text-white hover:bg-avocado-700 transition"
          @click="notificationStore.fetchNotifications()"
        >
          다시 시도
        </button>
      </div>

      <!-- 알림 목록 -->
      <div
        v-else-if="filteredNotifications.length > 0"
        class="space-y-3"
      >
        <NotificationCard
          v-for="notification in pagedNotifications"
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
        />

        <!-- 페이지네이션 -->
        <div
          v-if="totalPages > 1"
          class="flex items-center justify-center gap-2 pt-3 pb-4"
        >
          <!-- 처음 -->
          <button
            type="button"
            class="text-muted disabled:opacity-30"
            :disabled="page === 0"
            aria-label="첫 페이지"
            @click="goToPage(0)"
          >
            <ChevronsLeft :size="18" />
          </button>

          <!-- 이전 -->
          <button
            type="button"
            class="text-muted disabled:opacity-30"
            :disabled="page === 0"
            aria-label="이전 페이지"
            @click="goToPage(page - 1)"
          >
            <ChevronLeft :size="18" />
          </button>

          <!-- 페이지 번호 -->
          <button
            v-for="pageNumber in visiblePages"
            :key="pageNumber"
            type="button"
            class="w-7 h-7 rounded-full text-sm flex items-center justify-center"
            :class="
              page === pageNumber - 1
                ? 'bg-avocado-600 text-white font-medium'
                : 'text-muted'
            "
            @click="goToPage(pageNumber - 1)"
          >
            {{ pageNumber }}
          </button>

          <!-- 다음 -->
          <button
            type="button"
            class="text-muted disabled:opacity-30"
            :disabled="page >= totalPages - 1"
            aria-label="다음 페이지"
            @click="goToPage(page + 1)"
          >
            <ChevronRight :size="18" />
          </button>

          <!-- 마지막 -->
          <button
            type="button"
            class="text-muted disabled:opacity-30"
            :disabled="page >= totalPages - 1"
            aria-label="마지막 페이지"
            @click="goToPage(totalPages - 1)"
          >
            <ChevronsRight :size="18" />
          </button>
        </div>
      </div>

      <!-- 빈 상태 -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-16 text-muted"
      >
        <BellOff
          :size="40"
          class="mb-3 opacity-40"
        />

        <p class="text-sm font-medium text-gray-600">
          새로운 알림이 없어요
        </p>

        <p class="text-xs text-muted mt-1">
          최근 7일간의 알림만 보여요.
        </p>
      </div>
    </div>

    <Teleport to="body">
      <div
        class="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px]"
      >
        <BottomNavBar />
      </div>
    </Teleport>

    <ResultModal
      v-model="showReadAllErrorModal"
      variant="error"
      title="읽음 처리 실패"
      message="알림을 읽음 처리하지 못했어요. 다시 시도해주세요."
    />
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  watch
} from 'vue'

import {
  useRoute,
  useRouter
} from 'vue-router'

import {
  storeToRefs
} from 'pinia'

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
  UserRoundPlus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-vue-next'

import AppHeader from '@/components/common/AppHeader.vue'
import BottomNavBar from '@/components/common/BottomNavBar.vue'
import ResultModal from '@/components/common/ResultModal.vue'

import NotificationCard from '@/components/notification/NotificationCard.vue'

import {
  getFamilyRequests
} from '@/api/family'

import {
  formatMessageTime
} from '@/utils/format'

import {
  useNotificationStore
} from '@/stores/notification'

const route = useRoute()
const router = useRouter()

const notificationStore =
  useNotificationStore()

const {
  notifications,
  unreadCount,
  loading,
  error
} = storeToRefs(
  notificationStore
)

const PAGE_SIZE = 7
const PAGE_NUMBER_SIZE = 5

const page = ref(0)

const isMarkingAllRead =
  ref(false)

const showReadAllErrorModal =
  ref(false)

const isParent =
  computed(
    () =>
      route.meta.audience ===
      'parent'
  )

const subtitle =
  computed(() =>
    isParent.value
      ? '아이의 소중한 금융 활동을 확인해보세요.'
      : '소중한 소식들을 모아봤어요.'
  )

const childFilters = [
  {
    label: '전체',
    value: 'ALL'
  },
  {
    label: '용돈',
    value: 'WALLET'
  },
  {
    label: '저금',
    value: 'PIGGY_BANK'
  },
  {
    label: '리포트',
    value: 'REPORT'
  },
  {
    label: '기타',
    value: 'FAMILY'
  }
]

const parentFilters = [
  {
    label: '전체',
    value: 'ALL'
  },
  {
    label: '기타',
    value: 'FAMILY'
  }
]

const filters =
  computed(() =>
    isParent.value
      ? parentFilters
      : childFilters
  )

const activeFilter =
  ref('ALL')

const typeIconMap = {
  ALLOWANCE_RECEIVED:
    Banknote,

  FAMILY_INVITE_RECEIVED:
    UserRoundPlus,

  FAMILY_RELATION_APPROVED:
    BadgeCheck,

  SPENDING_REPORT_CREATED:
    BarChart3,

  CHEER_MESSAGE_RECEIVED:
    MessageCircleHeart,

  PIGGY_BANK_ACHIEVED:
    Trophy,

  PIGGY_BANK_BONUS_SET:
    PiggyBank,

  PIGGY_BANK_REFUNDED:
    PiggyBank,

  PIGGY_BANK_CREATED:
    PiggyBank,

  PIGGY_BANK_BONUS_REMINDER:
    PiggyBank,

  NEWS_ACTIVITY_COMPLETED:
    Bell,

  PAYMENT_HIGH_AMOUNT:
    Banknote,

  PAYMENT_RESTRICTED_MERCHANT:
    Banknote,

  WALLET:
    Banknote,

  PIGGY_BANK:
    PiggyBank,

  NEWS:
    BarChart3,

  SYSTEM:
    BarChart3
}

/**
 * 필터 적용
 */
const filteredNotifications =
  computed(() => {
    if (
      activeFilter.value ===
      'ALL'
    ) {
      return notifications.value
    }

    return notifications.value.filter(
      (notification) =>
        notification.category ===
        activeFilter.value
    )
  })

/**
 * 전체 페이지 수
 */
const totalPages =
  computed(() =>
    Math.ceil(
      filteredNotifications
        .value.length /
        PAGE_SIZE
    )
  )

/**
 * 현재 화면에 보여줄 7개
 */
const pagedNotifications =
  computed(() => {
    const start =
      page.value * PAGE_SIZE

    return filteredNotifications
      .value
      .slice(
        start,
        start + PAGE_SIZE
      )
  })

/**
 * 페이지 번호
 */
const visiblePages =
  computed(() => {
    const total =
      totalPages.value

    if (
      total <=
      PAGE_NUMBER_SIZE
    ) {
      return Array.from(
        {
          length: total
        },
        (_, index) =>
          index + 1
      )
    }

    const current =
      page.value + 1

    const half =
      Math.floor(
        PAGE_NUMBER_SIZE / 2
      )

    let start =
      current - half

    let end =
      current + half

    if (start < 1) {
      start = 1
      end =
        PAGE_NUMBER_SIZE
    }

    if (end > total) {
      end = total

      start =
        total -
        PAGE_NUMBER_SIZE +
        1
    }

    return Array.from(
      {
        length:
          end - start + 1
      },
      (_, index) =>
        start + index
    )
  })

function changeFilter(
  filterValue
) {
  if (
    activeFilter.value ===
    filterValue
  ) {
    return
  }

  activeFilter.value =
    filterValue

  page.value = 0
}

function goToPage(nextPage) {
  if (
    nextPage < 0 ||
    nextPage >=
      totalPages.value
  ) {
    return
  }

  page.value = nextPage
}

async function handleNotificationClick(
  notification
) {
  if (!notification.isRead) {
    try {
      await notificationStore.markAsRead(
        notification.id
      )
    } catch (err) {
      console.error(
        '알림 읽음 처리 실패:',
        err
      )
    }
  }

  if (
    notification.actionLabel
  ) {
    handleActionClick(
      notification
    )

    return
  }

  if (
    notification.type ===
    'FAMILY_INVITE_RECEIVED'
  ) {
    await openFamilyRequest()
    return
  }

  if (
    notification.type ===
    'ALLOWANCE_RECEIVED'
  ) {
    router.push({
      name: 'wallet'
    })

  } else if (
    notification.type ===
    'FAMILY_RELATION_APPROVED'
  ) {
    router.push({
      name: 'home'
    })

  } else if (
    notification.type ===
    'SPENDING_REPORT_CREATED'
  ) {
    router.push({
      name:
        isParent.value
          ? 'parent-report'
          : 'child-report'
    })

  } else if (
    notification.notifyType ===
    'PIGGY_BANK'
  ) {
    if (isParent.value) {
      router.push({
        name:
          'parent-piggy-list'
      })

    } else if (
      notification.referenceId
    ) {
      router.push({
        name:
          'piggyChildDetail',

        params: {
          id:
            notification.referenceId
        }
      })

    } else {
      router.push({
        name: 'piggy'
      })
    }

  } else if (
    notification.notifyType ===
    'WALLET'
  ) {
    router.push({
      name:
        isParent.value
          ? 'parent-home'
          : 'wallet'
    })

  } else if (
    notification.notifyType ===
    'NEWS'
  ) {
    if (
      notification.referenceId
    ) {
      router.push({
        name:
          isParent.value
            ? 'parent-newspaper-detail'
            : 'newspaper-detail',

        params: {
          newsId:
            notification.referenceId
        }
      })

    } else {
      router.push({
        name:
          isParent.value
            ? 'parent-newspaper'
            : 'newspaper'
      })
    }
  }
}

async function openFamilyRequest() {
  try {
    const {
      data: response
    } =
      await getFamilyRequests(
        'PENDING'
      )

    const pending =
      response.data ?? []

    if (
      pending.length === 1
    ) {
      router.push({
        name: 'family-check',

        params: {
          requestId:
            pending[0]
              .requestId
        }
      })

      return
    }

  } catch {
    // 목록 화면에서 다시 처리
  }

  router.push({
    name:
      'family-requests'
  })
}

async function handleActionClick(
  notification
) {
  if (!notification.isRead) {
    try {
      await notificationStore.markAsRead(
        notification.id
      )
    } catch (err) {
      console.error(
        '알림 읽음 처리 실패:',
        err
      )
    }
  }

  if (
    notification.notifyType ===
      'PIGGY_BANK' &&
    notification.referenceId
  ) {
    if (isParent.value) {
      router.push({
        name: 'piggyBonus',

        params: {
          id:
            notification.referenceId
        }
      })

    } else {
      router.push({
        name:
          'piggyChildDetail',

        params: {
          id:
            notification.referenceId
        }
      })
    }
  }
}

async function handleMarkAllAsRead() {
  if (
    isMarkingAllRead.value ||
    unreadCount.value === 0
  ) {
    return
  }

  isMarkingAllRead.value =
    true

  try {
    await notificationStore.markAllAsRead()

  } catch (err) {
    console.error(
      '전체 읽음 처리 실패:',
      err
    )

    showReadAllErrorModal.value =
      true

  } finally {
    isMarkingAllRead.value =
      false
  }
}

/**
 * SSE로 신규 알림이 들어오면서
 * 현재 페이지가 존재하지 않게 되는 경우 방지
 */
watch(
  totalPages,
  (nextTotalPages) => {
    if (
      nextTotalPages === 0
    ) {
      page.value = 0
      return
    }

    if (
      page.value >=
      nextTotalPages
    ) {
      page.value =
        nextTotalPages - 1
    }
  }
)

onMounted(() => {
  notificationStore.fetchNotifications()
})
</script>