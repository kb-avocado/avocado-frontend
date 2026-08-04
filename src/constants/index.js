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

/* 보너스 타입 (이자 / 정액) */
export const BONUS_TYPE = {
  RATE: 'RATE',
  FIXED: 'FIXED'
}
