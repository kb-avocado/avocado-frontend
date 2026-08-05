import api from './axiosInstance'

// 호출 예시
// getTransferRecipient('USER_CODE', 'AVO1234')
// getTransferRecipient('ACCOUNT_NUMBER', '1234567890')

/**
 * 사용자 코드 또는 계좌번호로 송금 대상을 조회합니다.
 *
 * @param {'USER_CODE' | 'ACCOUNT_NUMBER'} searchType
 * @param {string} keyword
 * @param {{ signal?: AbortSignal }} [config]
 */
export function getTransferRecipient(searchType, keyword, config = {}) {
  return api.get('/transfers/recipients', {
    params: {
      searchType,
      keyword
    },
    signal: config.signal
  })
}
