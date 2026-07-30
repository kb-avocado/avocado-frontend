import { TRANSFER_RECIPIENT_TYPE } from '../constants'

const validRecipientTypes = Object.values(TRANSFER_RECIPIENT_TYPE)

/**
 * 송금 화면으로 이동하기 전에 전달값을 검증하고
 * Vue Router query 객체를 생성합니다.
 *
 * @param {Object} params
 * @param {'WALLET' | 'ACCOUNT'} params.recipientType 송금 대상 유형
 * @param {number} params.recipientId 지갑 또는 계좌의 DB ID
 * @param {number} [params.amount] 미리 정해진 송금 금액
 * @returns {{
 *   recipientType: string,
 *   recipientId: string,
 *   amount?: string
 * }}
 * @throws {Error} 전달값이 올바르지 않은 경우
 *
 * @example
 * router.push({
 *   name: 'transfer',
 *   query: createTransferQuery({
 *     recipientType: TRANSFER_RECIPIENT_TYPE.WALLET,
 *     recipientId: 15,
 *     amount: 10000
 *   })
 * })
 */

export function createTransferQuery({ recipientType, recipientId, amount }) {
  if (!validRecipientTypes.includes(recipientType)) {
    throw new Error('올바르지 않은 송금 대상 유형입니다.')
  }
  if (!Number.isSafeInteger(recipientId) || recipientId <= 0) {
    throw new Error('올바르지 않은 송금 대상 ID입니다.')
  }
  if (amount !== undefined && (!Number.isSafeInteger(amount) || amount <= 0)) {
    throw new Error('송금 금액은 1원 이상의 정수여야 합니다.')
  }

  return {
    recipientType,
    recipientId: String(recipientId),
    ...(amount !== undefined && {
      amount: String(amount)
    })
  }
}
