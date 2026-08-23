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

function log(message, ...rest) {
  if (!import.meta.env.DEV) return

  console.log(
    `[알림] ${message}`,
    ...rest
  )
}

const SSE_MAX_RECOVERY_ATTEMPTS = 3

/**
 * 알림 타입 → 프론트 카테고리
 */
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
  PIGGY_BANK_BONUS_REMINDER: 'PIGGY_BANK',

  NEWS_ACTIVITY_COMPLETED: 'NEWS',

  PAYMENT_HIGH_AMOUNT: 'WALLET',
  PAYMENT_RESTRICTED_MERCHANT: 'WALLET'
}

/**
 * 서버 알림 DTO를 프론트에서 사용하는 형태로 변환
 */
function normalizeNotification(item) {
  if (!item) return null

  const id =
    item.notificationId ??
    item.id

  const isRead = Boolean(
    item.isRead ??
    item.read ??
    item.is_read ??
    false
  )

  const type =
    item.type ??
    item.notificationType ??
    item.notification_type ??
    item.notifyType ??
    item.notify_type ??
    'SYSTEM'

  const category =
    NOTIFICATION_CATEGORY_BY_TYPE[type] ??
    item.notifyType ??
    item.notify_type ??
    'SYSTEM'

  const title =
    item.title ?? ''

  const content =
    item.content ??
    item.message ??
    ''

  const referenceId =
    item.referenceId ??
    item.reference_id ??
    null

  let variant =
    item.variant ?? 'default'

  if (
    variant === 'default' &&
    (
      title.includes('고액') ||
      content.includes('고액')
    )
  ) {
    variant = 'danger'
  }

  let actionLabel =
    item.actionLabel ??
    item.action_label ??
    ''

  if (
    !actionLabel &&
    category === 'PIGGY_BANK' &&
    referenceId &&
    title.includes('저금 시작')
  ) {
    actionLabel = '응원 보너스 설정'
  }

  return {
    id,
    notificationId: id,

    userId:
      item.userId ??
      item.user_id,

    type,
    category,

    // 기존 화면 코드와 호환
    notifyType: category,

    title,
    content,
    isRead,
    referenceId,

    createdAt:
      item.createdAt ??
      item.created_at ??
      new Date().toISOString(),

    variant,
    actionLabel
  }
}

/**
 * 서버 응답에서 알림 배열 추출
 */
function unwrapList(response) {
  const data =
    response?.data?.data ??
    response?.data ??
    response

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

/**
 * 미읽음 개수 응답 추출
 */
function unwrapUnreadCount(response) {
  const data =
    response?.data?.data ??
    response?.data

  if (typeof data === 'number') {
    return data
  }

  if (
    typeof data?.unreadCount === 'number'
  ) {
    return data.unreadCount
  }

  if (
    typeof data?.count === 'number'
  ) {
    return data.count
  }

  return 0
}

export const useNotificationStore =
  defineStore('notification', {
    state: () => ({
      notifications: [],

      unreadCount: 0,

      loading: false,

      error: '',

      eventSource: null,

      sseConnected: false,

      sseRecovering: false,

      sseRecoveryAttempts: 0
    }),

    getters: {
      hasUnread:
        (state) =>
          state.unreadCount > 0
    },

    actions: {
      /**
       * 최근 7일 알림 조회
       *
       * 서버 최대 허용 size가 100이므로
       * 최근 7일 알림을 최대 100건 가져온다.
       *
       * 화면에서는 이 데이터를 다시
       * 7개씩 페이지네이션한다.
       */
      async fetchNotifications() {
        this.loading = true
        this.error = ''

        try {
          const response =
            await getNotifications({
              page: 0,
              size: 100
            })

          const rawList =
            unwrapList(response)

          this.notifications =
            rawList
              .map(
                normalizeNotification
              )
              .filter(Boolean)

          await this.fetchUnreadCount()

        } catch (err) {
          console.error(
            '알림 목록 조회 실패:',
            err
          )

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
       * 최근 7일 미읽음 개수
       */
      async fetchUnreadCount() {
        try {
          const response =
            await getUnreadNotificationCount()

          this.unreadCount =
            unwrapUnreadCount(response)

        } catch (err) {
          console.error(
            '미읽음 알림 개수 조회 실패:',
            err
          )
        }
      },

      /**
       * 단건 읽음 처리
       */
      async markAsRead(
        notificationId
      ) {
        const target =
          this.notifications.find(
            (notification) =>
              notification.id ===
              notificationId
          )

        const wasUnread =
          target
            ? !target.isRead
            : true

        // 낙관적 업데이트
        if (target) {
          target.isRead = true
        }

        if (wasUnread) {
          this.unreadCount =
            Math.max(
              0,
              this.unreadCount - 1
            )
        }

        try {
          await markNotificationAsRead(
            notificationId
          )

        } catch (err) {
          console.error(
            '알림 읽음 처리 실패:',
            err
          )

          // 실패 시 롤백
          if (
            target &&
            wasUnread
          ) {
            target.isRead = false
            this.unreadCount += 1
          }

          throw err
        }
      },

      /**
       * 최근 7일 알림 전체 읽음
       */
      async markAllAsRead() {
        const previousState =
          this.notifications.map(
            (notification) => ({
              id: notification.id,
              isRead:
                notification.isRead
            })
          )

        const previousCount =
          this.unreadCount

        // 낙관적 업데이트
        this.notifications.forEach(
          (notification) => {
            notification.isRead = true
          }
        )

        this.unreadCount = 0

        try {
          await markAllNotificationsAsRead()

        } catch (err) {
          console.error(
            '알림 전체 읽음 처리 실패:',
            err
          )

          // 롤백
          this.notifications.forEach(
            (notification) => {
              const previous =
                previousState.find(
                  (item) =>
                    item.id ===
                    notification.id
                )

              if (previous) {
                notification.isRead =
                  previous.isRead
              }
            }
          )

          this.unreadCount =
            previousCount

          throw err
        }
      },

      /**
       * 알림 삭제
       */
      async removeNotification(
        notificationId
      ) {
        const index =
          this.notifications.findIndex(
            (notification) =>
              notification.id ===
              notificationId
          )

        if (index === -1) {
          return
        }

        const removedItem =
          this.notifications[index]

        this.notifications.splice(
          index,
          1
        )

        if (
          !removedItem.isRead
        ) {
          this.unreadCount =
            Math.max(
              0,
              this.unreadCount - 1
            )
        }

        try {
          await deleteNotification(
            notificationId
          )

        } catch (err) {
          console.error(
            '알림 삭제 실패:',
            err
          )

          this.notifications.splice(
            index,
            0,
            removedItem
          )

          if (
            !removedItem.isRead
          ) {
            this.unreadCount += 1
          }

          throw err
        }
      },

      /**
       * 로그인 상태에 따라 SSE 연결
       */
      sync(user) {
        if (
          user?.status === 'ACTIVE'
        ) {
          this.subscribeSse()
          return
        }

        this.reset()
      },

      /**
       * SSE 구독
       */
      subscribeSse() {
        if (this.eventSource) {
          return
        }

        const subscribeUrl =
          getNotificationSubscribeUrl()

        try {
          this.eventSource =
            new EventSource(
              subscribeUrl,
              {
                withCredentials: true
              }
            )

          log('구독 요청')

          this.eventSource.onopen =
            () => {
              this.sseConnected = true

              this.sseRecoveryAttempts =
                0
            }

          this.eventSource.onmessage =
            (event) => {
              this.handleIncomingSseData(
                event.data
              )
            }

          this.eventSource.addEventListener(
            'notification',
            (event) => {
              this.handleIncomingSseData(
                event.data
              )
            }
          )

          this.eventSource.addEventListener(
            'connect',
            () => {
              this.sseConnected = true
              log('구독 시작')
            }
          )

          this.eventSource.onerror =
            () => {
              this.sseConnected = false

              if (
                this.eventSource
                  ?.readyState ===
                EventSource.CLOSED
              ) {
                this.eventSource = null

                log(
                  '연결 끊김 (재연결 포기, 인증 만료 가능성)'
                )

                this.recoverClosedSse()

                return
              }

              log(
                '연결 끊김 (재연결 시도 중)'
              )
            }

        } catch (err) {
          console.error(
            'SSE 구독 생성 실패:',
            err
          )

          this.eventSource = null
          this.sseConnected = false
        }
      },

      /**
       * 닫힌 SSE 복구
       */
      async recoverClosedSse() {
        if (this.sseRecovering) {
          return
        }

        if (
          this.sseRecoveryAttempts >=
          SSE_MAX_RECOVERY_ATTEMPTS
        ) {
          log(
            '복구 중단 (재시도 한도 초과)'
          )

          return
        }

        this.sseRecovering = true
        this.sseRecoveryAttempts += 1

        try {
          await requestRefresh()

          log(
            '토큰 재발급 후 재구독'
          )

        } catch {
          log(
            '복구 실패 (재로그인 필요)'
          )

        } finally {
          this.sseRecovering = false
        }
      },

      /**
       * 실시간 알림 수신
       */
      handleIncomingSseData(
        rawData
      ) {
        if (
          !rawData ||
          rawData === 'connected' ||
          rawData === 'heartbeat'
        ) {
          return
        }

        try {
          const parsed =
            typeof rawData === 'string'
              ? JSON.parse(rawData)
              : rawData

          const normalized =
            normalizeNotification(
              parsed?.data ??
              parsed
            )

          if (
            normalized &&
            normalized.id
          ) {
            const exists =
              this.notifications.some(
                (notification) =>
                  notification.id ===
                  normalized.id
              )

            if (!exists) {
              this.notifications.unshift(
                normalized
              )

              if (
                !normalized.isRead
              ) {
                this.unreadCount += 1
              }

              log(
                '알림 수신',
                normalized
              )
            }
          }

        } catch {
          // 파싱할 수 없는 메시지는 무시
        }
      },

      /**
       * SSE 해제
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
       * 로그아웃 등 상태 초기화
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