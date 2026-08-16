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

export const TRANSFER_BANKS = [
  { code: 'AVOCADO', name: '아보카도 은행' },
  { code: 'KB', name: 'KB국민은행' },
  { code: 'SHINHAN', name: '신한은행' },
  { code: 'HANA', name: '하나은행' },
  { code: 'WOORI', name: '우리은행' },
  { code: 'NH', name: 'NH농협은행' },
  { code: 'KAKAO', name: '카카오뱅크' },
  { code: 'TOSS', name: '토스뱅크' }
]

/* 보너스 타입 (이자 / 정액) */
export const BONUS_TYPE = {
  RATE: 'RATE',
  FIXED: 'FIXED'
}
