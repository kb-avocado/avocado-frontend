import axiosInstance from './axiosInstance'

/**
 * 특정 아이의 선불 지갑을 조회합니다.
 *
 * @param {string|number} childId 아이 ID
 */
export function getChildWallet(childId) {
  return axiosInstance.get(`/wallets/${childId}`)
}
