export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export const TRANSACTION_TYPE = {}

/* 수취 대상 타입 (아보카도 내부 지갑 / 은행 계좌) */
export const TRANSFER_RECIPIENT_TYPE = {
  WALLET: 'WALLET',
  ACCOUNT: 'ACCOUNT'
}

/* 보너스 타입 (이자 / 정액) */
export const BONUS_TYPE = {
  RATE: 'RATE',
  FIXED: 'FIXED'
}
