import axiosInstance from './axiosInstance'

/**
 * 특정 아이의 선불 지갑을 조회합니다.
 *
 * @param {string|number} childId 아이 ID
 */
export function getChildWallet(childId) {
  return axiosInstance.get(`/wallets/${childId}`)
}

/**
 * 로그인한 아이의 지갑 거래 내역을 페이지 단위로 조회합니다.
 *
 * @param {{page?: number, size?: number, signal?: AbortSignal}} options
 */
export function getWalletTransactions({ page, size, signal } = {}) {
  return axiosInstance.get('/wallets/transactions', { params: { page, size }, signal })
}

/**
 * 로그인한 아이의 지갑 거래 상세를 조회합니다.
 *
 * @param {string|number} transactionId 거래 ID
 * @param {{signal?: AbortSignal}} options
 */
export function getWalletTransactionDetail(transactionId, { signal } = {}) {
  return axiosInstance.get(`/wallets/transactions/${transactionId}`, { signal })
}
