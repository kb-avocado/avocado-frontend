import { defineStore } from 'pinia'
import { requestRefresh } from '@/api/axiosInstance'
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationSubscribeUrl
} from '@/api/notification'

// 구독이 언제 열리고 닫히는지는 화면에 드러나지 않아 개발 중에는 로그로 확인한다.
// 배포 빌드에서는 아무것도 출력하지 않는다.
function log(message, ...rest) {
  if (!import.meta.env.DEV) return

  console.log(`[알림] ${message}`, ...rest)
}

// 스트림이 끊겼을 때 토큰을 재발급해 다시 붙어보는 최대 횟수.
// 재발급이 성공해도 연결이 계속 실패하는 상황에서 서버를 반복해 두드리지 않도록 막는다.
const SSE_MAX_RECOVERY_ATTEMPTS = 3

const NOTIFICATION_CATEGORY_BY_TYPE = {
  ALLOWANCE_RECEIVED: 'WALLET',
  FAMILY_INVITE_RECEIVED: 'FAMILY',
  FAMILY_RELATION_APPROVED: 'FAMILY',
  SPENDING_REPORT_CREATED: 'REPORT',
  CHEER_MESSAGE_RECEIVED: 'PIGGY_BANK',
  PIGGY_BANK_ACHIEVED: 'PIGGY_BANK',
  PIGGY_BANK_BONUS_SET: 'PIGGY_BANK',
  PIGGY_BANK_REFUNDED: 'PIGGY_BANK',
  PIGGY_BANK_CREATED: 'PIGGY_BANK',
  PIGGY_BANK_BONUS_REMINDER: 'PIGGY_BANK'
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
    sseConnected: false,
    // 끊긴 스트림을 되살리는 중인지. 같은 복구를 두 번 시작하지 않기 위한 표시다.
    sseRecovering: false,
    // 연결에 성공하지 못한 채 이어진 복구 시도 횟수
    sseRecoveryAttempts: 0
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
     * 로그인한 계정 상태에 맞춰 실시간 구독을 켜고 끈다.
     *
     * 가입 절차를 마친(ACTIVE) 계정만 구독한다. 계좌 연결·가족 연결이 남은 계정은
     * 연결을 끝내는 순간 상태가 바뀌면서 이 함수를 다시 지나므로 그때 열린다.
     * 이미 상태에 맞춰져 있으면 아무 일도 하지 않아 여러 번 불러도 안전하다.
     *
     * @param user 현재 로그인한 회원. 없거나 ACTIVE가 아니면 구독을 닫고 비운다.
     */
    sync(user) {
      if (user?.status === 'ACTIVE') {
        this.subscribeSse()
        return
      }

      // 계정이 바뀌었을 수 있으므로 연결만 끊지 않고 이전 사용자의 알림도 함께 비운다.
      this.reset()
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

        log('구독 요청')

        this.eventSource.onopen = () => {
          this.sseConnected = true
          // 한 번이라도 붙었으면 이전 실패는 잊는다.
          this.sseRecoveryAttempts = 0
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
          log('구독 시작')
        })

        this.eventSource.onerror = () => {
          this.sseConnected = false

          // CLOSED면 브라우저가 재연결을 포기한 것이고, CONNECTING이면 다시 붙는 중이다.
          // 인증이 만료되면 401이 오는데 규격상 이때 브라우저는 재연결하지 않으므로,
          // 죽은 객체를 버려야 토큰 재발급 후 subscribeSse()가 새로 연결할 수 있다.
          if (this.eventSource?.readyState === EventSource.CLOSED) {
            this.eventSource = null
            log('연결 끊김 (재연결 포기, 인증 만료 가능성)')
            this.recoverClosedSse()
            return
          }

          log('연결 끊김 (재연결 시도 중)')
        }
      } catch (err) {
        console.error('SSE 구독 생성 실패:', err)
        this.eventSource = null
        this.sseConnected = false
      }
    },

    /**
     * 브라우저가 재연결을 포기한 스트림을 되살린다.
     *
     * EventSource는 브라우저가 직접 여는 연결이라 axios 인터셉터를 타지 않는다.
     * 그래서 액세스 토큰이 만료돼 401로 끊겨도 자동 재발급이 걸리지 않고,
     * 다른 화면에서 API를 부를 때까지 알림이 멈춘 채로 남는다.
     * 여기서 직접 재발급을 요청해 그 공백을 없앤다.
     *
     * 재발급에 성공하면 requestRefresh가 sync()를 불러 스트림을 다시 연다.
     * 실패는 로그인 만료이므로 다음 API 요청이 로그인 화면으로 보내도록 두고,
     * 화면 이동을 여기서 일으키지는 않는다. 사용자가 보고 있던 작업이 끊기기 때문이다.
     */
    async recoverClosedSse() {
      if (this.sseRecovering) return

      // 재발급은 됐는데 연결은 계속 실패하는 경우가 있다. 그대로 두면 서버를 계속 두드리게 되어
      // 몇 번 시도한 뒤 멈춘다. 다시 붙는 순간 onopen에서 횟수가 0으로 돌아간다.
      if (this.sseRecoveryAttempts >= SSE_MAX_RECOVERY_ATTEMPTS) {
        log('복구 중단 (재시도 한도 초과)')
        return
      }

      this.sseRecovering = true
      this.sseRecoveryAttempts += 1

      try {
        await requestRefresh()
        log('토큰 재발급 후 재구독')
      } catch {
        // 리프레시 토큰까지 만료된 상태다. 여기서 할 수 있는 일은 없다.
        log('복구 실패 (재로그인 필요)')
      } finally {
        this.sseRecovering = false
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
            log('알림 수신', normalized)
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
      this.sseRecoveryAttempts = 0

      if (this.eventSource) {
        this.eventSource.close()
        this.eventSource = null
        this.sseConnected = false
        log('구독 해제')
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
