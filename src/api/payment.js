import axiosInstance from './axiosInstance'

/**
 * 결제 QR 토큰을 발급합니다.
 */
export function issuePaymentQr() {
  return axiosInstance.post('/payments/qr')
}

/**
 * 만료된 결제 QR 토큰을 재발급합니다.
 */
export function reissuePaymentQr() {
  return axiosInstance.post('/payments/qr/reissue')
}

/**
 * 로그인 사용자의 현재 결제 QR 토큰을 무효화합니다.
 *
 * @param {string} token 무효화할 QR 토큰
 */
export function invalidatePaymentQr(token) {
  return axiosInstance.delete('/payments/qr', { params: { token } })
}

/**
 * 결제 QR의 현재 처리 상태를 조회합니다.
 *
 * @param {string} token QR 토큰
 */
export function getPaymentQrStatus(token) {
  return axiosInstance.get('/payments/qr/status', { params: { token } })
}

/**
 * 결제 대기 중인 QR 토큰 목록을 조회합니다.
 */
export function getActivePaymentQrTokens() {
  return axiosInstance.get('/admin/payments/qr-tokens')
}

/**
 * 선택한 QR 토큰으로 결제를 시뮬레이션합니다.
 */
export function simulatePayment(payload) {
  return axiosInstance.post('/admin/payments/simulate', payload)
}
