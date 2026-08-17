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
 * 결제 QR의 현재 처리 상태를 조회합니다.
 *
 * @param {string} token QR 토큰
 */
export function getPaymentQrStatus(token) {
  return axiosInstance.get('/payments/qr/status', { params: { token } })
}
