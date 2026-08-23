import api from './axiosInstance'

/**
 * 최근 송금 대상을 조회합니다.
 *
 * @param {{ signal?: AbortSignal }} [config]
 */
export function getRecentTransferRecipients(config = {}) {
  return api.get('/transfers/recipients/recent', {
    signal: config.signal
  })
}

/**
 * 아이 선불지갑에서 내부 지갑 또는 외부 계좌로 송금합니다.
 *
 * @param {{ bankCode: string, recipientNumber: string, recipientName: string, amount: number }} payload
 */
export function transferFromWallet({ bankCode, recipientNumber, recipientName, amount }) {
  return api.post('/transfers/wallet', {
    bankCode,
    recipientNumber,
    recipientName,
    amount: Number(amount)
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