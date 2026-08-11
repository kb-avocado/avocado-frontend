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
