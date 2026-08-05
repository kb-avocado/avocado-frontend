import { TRANSFER_RECIPIENT_SEARCH_TYPE } from '../constants'

const validSearchTypes = Object.values(TRANSFER_RECIPIENT_SEARCH_TYPE)

/**
 * 송금 화면으로 이동하기 전에 전달값을 검증하고
 * Vue Router query 객체를 생성합니다.
 *
 * @param {Object} params
 * @param {'USER_CODE' | 'ACCOUNT_NUMBER'} params.searchType 송금 대상 검색 기준
 * @param {string} params.keyword 사용자 코드 또는 지갑 계좌번호
 * @param {number} [params.amount] 미리 정해진 송금 금액
 * @returns {{
 *   searchType: string,
 *   keyword: string,
 *   amount?: string
 * }}
 * @throws {Error} 전달값이 올바르지 않은 경우
 *
 * @example
 * router.push({
 *   name: 'transfer-recipient',
 *   query: createTransferQuery({
 *     searchType: TRANSFER_RECIPIENT_SEARCH_TYPE.USER_CODE,
 *     keyword: 'AVO1234',
 *     amount: 10000
 *   })
 * })
 */

export function createTransferQuery({ searchType, keyword, amount }) {
  if (!validSearchTypes.includes(searchType)) {
    throw new Error('올바르지 않은 송금 대상 검색 유형입니다.')
  }

  const normalizedKeyword = normalizeTransferRecipientKeyword(searchType, keyword)

  if (!normalizedKeyword) throw new Error('송금 대상 검색어를 입력해주세요.')

  if (
    searchType === TRANSFER_RECIPIENT_SEARCH_TYPE.ACCOUNT_NUMBER &&
    !/^\d+$/.test(normalizedKeyword)
  ) {
    throw new Error('계좌번호는 숫자만 입력해주세요.')
  }

  if (amount !== undefined && (!Number.isSafeInteger(amount) || amount <= 0)) {
    throw new Error('송금 금액은 1원 이상의 정수여야 합니다.')
  }

  return {
    searchType,
    keyword: normalizedKeyword,
    ...(amount !== undefined && {
      amount: String(amount)
    })
  }
}

export function normalizeTransferRecipientKeyword(searchType, keyword) {
  if (typeof keyword !== 'string') return ''

  const trimmedKeyword = keyword.trim()

  if (searchType === TRANSFER_RECIPIENT_SEARCH_TYPE.ACCOUNT_NUMBER) {
    return trimmedKeyword.replace(/[\s-]/g, '')
  }

  if (searchType === TRANSFER_RECIPIENT_SEARCH_TYPE.USER_CODE) {
    return trimmedKeyword.toUpperCase()
  }

  return trimmedKeyword
}
