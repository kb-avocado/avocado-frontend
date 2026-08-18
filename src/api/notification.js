import axiosInstance from './axiosInstance'

/**
 * 최근 7일 알림 목록을 조회합니다.
 */
export function getNotifications() {
  return axiosInstance.get('/notifications')
}

/**
 * 최근 7일 미읽음 알림 개수를 조회합니다.
 */
export function getUnreadNotificationCount() {
  return axiosInstance.get('/notifications/unread-count')
}

/**
 * 특정 알림을 읽음 처리합니다.
 *
 * @param {string|number} notificationId
 */
export function markNotificationAsRead(notificationId) {
  return axiosInstance.patch(`/notifications/${notificationId}/read`)
}

/**
 * 최근 7일 미읽음 알림을 전체 읽음 처리합니다.
 */
export function markAllNotificationsAsRead() {
  return axiosInstance.patch('/notifications/read-all')
}

/**
 * 알림 단건 상세를 조회합니다.
 *
 * @param {string|number} notificationId
 */
export function getNotification(notificationId) {
  return axiosInstance.get(`/notifications/${notificationId}`)
}

/**
 * 알림을 삭제합니다.
 *
 * @param {string|number} notificationId
 */
export function deleteNotification(notificationId) {
  return axiosInstance.delete(`/notifications/${notificationId}`)
}

/**
 * SSE 실시간 알림 구독 URL을 반환합니다.
 */
export function getNotificationSubscribeUrl() {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
  return `${baseURL.replace(/\/$/, '')}/notifications/subscribe`
}
