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

/**
 * 최근 송금 대상을 조회합니다.
 *
 * @param {{ signal?: AbortSignal }} [config]
 */
export function getRecentTransferRecipients(config = {}) {
  return api.get('/transfers/recent-recipients', {
    signal: config.signal
  })
}

/**
 * 로그인한 보호자의 계좌에서 연결된 아이의 선불지갑으로 송금합니다.
 *
 * @param {{ childId: string | number, amount: number }} payload
 */
export function transferAccountToWallet({ childId, amount }) {
  return api.post('/transfers/account-to-wallet', {
    childId: Number(childId),
    amount: Number(amount)
  })
}
