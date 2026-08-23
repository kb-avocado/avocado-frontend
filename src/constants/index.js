export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const TRANSACTION_TYPE = {}

/* 수취 대상 타입 (아보카도 내부 지갑 / 은행 계좌) */
export const TRANSFER_RECIPIENT_TYPE = {
  WALLET: 'WALLET',
  ACCOUNT: 'ACCOUNT'
}

/* 송금 대상 검색 기준 (사용자 코드 / 지갑 계좌번호) */
export const TRANSFER_RECIPIENT_SEARCH_TYPE = {
  USER_CODE: 'USER_CODE',
  ACCOUNT_NUMBER: 'ACCOUNT_NUMBER'
}

/* 은행 코드 */
export const TRANSFER_BANKS = [
  { code: '999', name: '아보카도 은행' },
  { code: '004', name: 'KB국민은행' },
  { code: '088', name: '신한은행' },
  { code: '081', name: '하나은행' },
  { code: '020', name: '우리은행' },
  { code: '011', name: 'NH농협은행' },
  { code: '090', name: '카카오뱅크' },
  { code: '092', name: '토스뱅크' }
]

/* 보너스 타입 (이자 / 정액) */
export const BONUS_TYPE = {
  RATE: 'RATE',
  FIXED: 'FIXED'
}
