import { defineStore } from 'pinia'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationSubscribeUrl
} from '@/api/notification'

const NOTIFICATION_CATEGORY_BY_TYPE = {
  ALLOWANCE_RECEIVED: 'WALLET',
  FAMILY_INVITE_RECEIVED: 'FAMILY',
  FAMILY_RELATION_APPROVED: 'FAMILY',
  SPENDING_REPORT_CREATED: 'REPORT',
  CHEER_MESSAGE_RECEIVED: 'PIGGY_BANK',
  PIGGY_BANK_ACHIEVED: 'PIGGY_BANK'
}

function normalizeNotification(item) {
  if (!item) return null

  const id = item.notificationId ?? item.id
  const isRead = Boolean(item.isRead ?? item.read ?? item.is_read ?? false)
  const type =
    item.type ??
    item.notificationType ??
    item.notification_type ??
    item.notifyType ??
    item.notify_type ??
    'SYSTEM'
  const category =
    NOTIFICATION_CATEGORY_BY_TYPE[type] ?? item.notifyType ?? item.notify_type ?? 'SYSTEM'
  const title = item.title ?? ''
  const content = item.content ?? item.message ?? ''
  const referenceId = item.referenceId ?? item.reference_id ?? null

  let variant = item.variant ?? 'default'
  if (variant === 'default' && (title.includes('고액') || content.includes('고액'))) {
    variant = 'danger'
  }

  let actionLabel = item.actionLabel ?? item.action_label ?? ''
  if (!actionLabel && category === 'PIGGY_BANK' && referenceId && title.includes('저금 시작')) {
    actionLabel = '응원 보너스 설정'
  }

  return {
    id,
    notificationId: id,
    userId: item.userId ?? item.user_id,
    type,
    category,
    notifyType: category,
    title,
    content,
    isRead,
    referenceId,
    createdAt: item.createdAt ?? item.created_at ?? new Date().toISOString(),
    variant,
    actionLabel
  }
}

function unwrapList(response) {
  const data = response?.data?.data ?? response?.data ?? response
  if (Array.isArray(data)) {
    return data
  }
  if (Array.isArray(data?.items)) {
    return data.items
  }
  if (Array.isArray(data?.notifications)) {
    return data.notifications
  }
  if (Array.isArray(data?.content)) {
    return data.content
  }
  return []
}

function unwrapUnreadCount(response) {
  const data = response.data?.data ?? response.data
  if (typeof data === 'number') {
    return data
  }
  if (typeof data?.unreadCount === 'number') {
    return data.unreadCount
  }
  if (typeof data?.count === 'number') {
    return data.count
  }
  return 0
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: '',
    eventSource: null,
    sseConnected: false
  }),

  getters: {
    hasUnread: (state) => state.unreadCount > 0
  },

  actions: {
    /**
     * 알림 목록 조회 (최근 7일)
     */
    async fetchNotifications() {
      this.loading = true
      this.error = ''

      try {
        const response = await getNotifications()
        const rawList = unwrapList(response)
        this.notifications = rawList.map(normalizeNotification).filter(Boolean)

        // 목록은 페이지 단위이므로 전체 미읽음 개수는 전용 API 값으로 맞춘다.
        await this.fetchUnreadCount()
      } catch (err) {
        console.error('알림 목록 조회 실패:', err)
        this.error =
          err?.response?.data?.message ||
          err?.message ||
          '알림 목록을 불러오지 못했습니다.'
        this.notifications = []
      } finally {
        this.loading = false
      }
    },

    /**
     * 미읽음 알림 개수 조회 (최근 7일)
     */
    async fetchUnreadCount() {
      try {
        const response = await getUnreadNotificationCount()
        this.unreadCount = unwrapUnreadCount(response)
      } catch (err) {
        console.error('미읽음 알림 개수 조회 실패:', err)
      }
    },

    /**
     * 알림 단건 읽음 처리
     */
    async markAsRead(notificationId) {
      const target = this.notifications.find((n) => n.id === notificationId)
      const wasUnread = target ? !target.isRead : true

      // 낙관적 업데이트
      if (target) {
        target.isRead = true
      }
      if (wasUnread) {
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }

      try {
        await markNotificationAsRead(notificationId)
      } catch (err) {
        console.error('알림 읽음 처리 실패:', err)
        // 실패 시 롤백
        if (target && wasUnread) {
          target.isRead = false
          this.unreadCount += 1
        }
        throw err
      }
    },

    /**
     * 최근 7일 미읽음 알림 전체 읽음 처리
     */
    async markAllAsRead() {
      const previousState = this.notifications.map((n) => ({ id: n.id, isRead: n.isRead }))
      const previousCount = this.unreadCount

      // 낙관적 업데이트
      this.notifications.forEach((n) => {
        n.isRead = true
      })
      this.unreadCount = 0

      try {
        await markAllNotificationsAsRead()
      } catch (err) {
        console.error('알림 전체 읽음 처리 실패:', err)
        // 롤백
        this.notifications.forEach((n) => {
          const prev = previousState.find((p) => p.id === n.id)
          if (prev) n.isRead = prev.isRead
        })
        this.unreadCount = previousCount
        throw err
      }
    },

    /**
     * 알림 단건 삭제
     */
    async removeNotification(notificationId) {
      const index = this.notifications.findIndex((n) => n.id === notificationId)
      if (index === -1) return

      const removedItem = this.notifications[index]
      // 낙관적 제거
      this.notifications.splice(index, 1)
      if (!removedItem.isRead) {
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }

      try {
        await deleteNotification(notificationId)
      } catch (err) {
        console.error('알림 삭제 실패:', err)
        // 롤백
        this.notifications.splice(index, 0, removedItem)
        if (!removedItem.isRead) {
          this.unreadCount += 1
        }
        throw err
      }
    },

    /**
     * SSE 실시간 알림 구독
     */
    subscribeSse() {
      if (this.eventSource) {
        return
      }

      const subscribeUrl = getNotificationSubscribeUrl()

      try {
        this.eventSource = new EventSource(subscribeUrl, { withCredentials: true })

        this.eventSource.onopen = () => {
          this.sseConnected = true
        }

        // 기본 메시지 이벤트
        this.eventSource.onmessage = (event) => {
          this.handleIncomingSseData(event.data)
        }

        // 커스텀 notification 이벤트 수신 (Spring SseEmitter에서 eventName("notification")을 지정한 경우)
        this.eventSource.addEventListener('notification', (event) => {
          this.handleIncomingSseData(event.data)
        })

        // 연결 확인용 더미 이벤트 (connect 등)
        this.eventSource.addEventListener('connect', () => {
          this.sseConnected = true
        })

        this.eventSource.onerror = () => {
          this.sseConnected = false
          // 브라우저가 자동으로 재연결을 시도하므로 치명적이지 않은 경우 유지
          if (this.eventSource?.readyState === EventSource.CLOSED) {
            this.eventSource = null
          }
        }
      } catch (err) {
        console.error('SSE 구독 생성 실패:', err)
        this.eventSource = null
        this.sseConnected = false
      }
    },

    /**
     * 수신된 SSE 데이터 처리
     */
    handleIncomingSseData(rawData) {
      if (!rawData || rawData === 'connected' || rawData === 'heartbeat') return

      try {
        const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData
        const normalized = normalizeNotification(parsed?.data ?? parsed)

        if (normalized && normalized.id) {
          // 이미 목록에 있는지 확인
          const exists = this.notifications.some((n) => n.id === normalized.id)
          if (!exists) {
            this.notifications.unshift(normalized)
            if (!normalized.isRead) {
              this.unreadCount += 1
            }
          }
        }
      } catch (e) {
        // 단순 문자열 등 파싱 불가 메시지 무시
      }
    },

    /**
     * SSE 구독 해제
     */
    unsubscribeSse() {
      if (this.eventSource) {
        this.eventSource.close()
        this.eventSource = null
        this.sseConnected = false
      }
    },

    /**
     * 스토어 상태 초기화 (로그아웃 시 등)
     */
    reset() {
      this.unsubscribeSse()
      this.notifications = []
      this.unreadCount = 0
      this.loading = false
      this.error = ''
    }
  }
})
import { ref } from 'vue'

// EventSource는 화면에 그릴 값이 아니라 연결 그 자체라 리액티브 상태로 두지 않는다.
let source = null

// 연결이 언제 열리고 닫히는지는 화면에 드러나지 않아 개발 중에는 로그로 확인한다.
function log(message, ...rest) {
  if (!import.meta.env.DEV) return

  console.log(`[알림] ${message}`, ...rest)
}

/**
 * 실시간 알림(SSE) 연결을 관리한다.
 */
export const useNotificationStore = defineStore('notification', () => {
  // 연결 여부. 화면에서 실시간 표시를 켤지 판단할 때 쓴다.
  const connected = ref(false)

  // 연결된 동안 받은 알림. 최신이 앞이다.
  // 끊겨 있는 동안 쌓인 알림은 여기 없으므로 목록은 조회 API로 채워야 한다.
  const received = ref([])

  /**
   * 로그인 상태에 맞춰 알림 스트림을 열거나 닫는다.
   *
   * 라우터 가드가 화면을 옮길 때마다 부르기 때문에 이미 열려 있으면 아무 일도 하지 않는다.
   * 덕분에 로그인 직후, 회원가입 직후, 새로고침 복구를 한곳에서 함께 처리할 수 있다.
   *
   * @param user 현재 로그인한 회원. 없으면 연결을 닫는다.
   */
  function sync(user) {
    if (user?.status === 'ACTIVE') {
      connect()
      return
    }

    disconnect()
  }

  function connect() {
    if (source) return

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

    // EventSource는 헤더를 붙일 수 없어 쿠키로만 인증한다.
    // 배포처럼 출처가 다를 때도 쿠키를 실으려면 withCredentials가 필요하다.
    source = new EventSource(`${baseUrl}/notifications/subscribe`, {
      withCredentials: true
    })

    log('구독 요청')

    // 서버가 연결 직후 한 번 보내는 확인용 이벤트다. 담긴 값은 쓰지 않는다.
    source.addEventListener('connect', () => {
      connected.value = true
      log('구독 시작')
    })

    // 이벤트 이름이 붙어 있어 onmessage로는 잡히지 않는다.
    source.addEventListener('notification', (event) => {
      const notification = JSON.parse(event.data)

      received.value.unshift(notification)
      log('알림 수신', notification)
    })

    source.onerror = () => {
      connected.value = false

      // CLOSED면 브라우저가 재연결을 포기한 것이고, CONNECTING이면 다시 붙는 중이다.
      log(
        source?.readyState === EventSource.CLOSED
          ? '연결 끊김 (재연결 포기, 인증 만료 가능성)'
          : '연결 끊김 (재연결 시도 중)'
      )

      if (source?.readyState === EventSource.CLOSED) {
        disconnect()
      }

      // CONNECTING이면 브라우저가 알아서 다시 붙는 중이라 그대로 둔다.
    }
  }

  /**
   * 알림 스트림을 닫는다.
   * 로그아웃은 쿠키만 만료시킬 뿐, 이미 열린 스트림은 서버가 끊지 않는다.
   */
  function disconnect() {
    if (!source) return

    source.close()
    source = null
    connected.value = false
    received.value = []

    log('구독 해제')
  }

  return { connected, received, sync, disconnect }
})
