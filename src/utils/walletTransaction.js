export const WALLET_TRANSACTION_TYPE = Object.freeze({
  CHARGE: 'CHARGE',
  CHARGE_CANCEL: 'CHARGE_CANCEL',
  PAYMENT: 'PAYMENT',
  PAYMENT_CANCEL: 'PAYMENT_CANCEL',
  TRANSFER_OUT: 'TRANSFER_OUT',
  TRANSFER_IN: 'TRANSFER_IN',
  TRANSFER_CANCEL_OUT: 'TRANSFER_CANCEL_OUT',
  TRANSFER_CANCEL_IN: 'TRANSFER_CANCEL_IN',
  PIGGY_BANK_DEPOSIT: 'PIGGY_BANK_DEPOSIT',
  PIGGY_BANK_WITHDRAWAL: 'PIGGY_BANK_WITHDRAWAL'
})

const RECENT_TRANSACTION_TYPES = new Set([
  WALLET_TRANSACTION_TYPE.PAYMENT,
  WALLET_TRANSACTION_TYPE.PAYMENT_CANCEL,
  WALLET_TRANSACTION_TYPE.PIGGY_BANK_DEPOSIT
])

const IN_TRANSACTION_TYPES = new Set([
  WALLET_TRANSACTION_TYPE.CHARGE,
  WALLET_TRANSACTION_TYPE.PAYMENT_CANCEL,
  WALLET_TRANSACTION_TYPE.TRANSFER_IN,
  WALLET_TRANSACTION_TYPE.TRANSFER_CANCEL_OUT,
  WALLET_TRANSACTION_TYPE.PIGGY_BANK_WITHDRAWAL
])

const OUT_TRANSACTION_TYPES = new Set([
  WALLET_TRANSACTION_TYPE.CHARGE_CANCEL,
  WALLET_TRANSACTION_TYPE.PAYMENT,
  WALLET_TRANSACTION_TYPE.TRANSFER_OUT,
  WALLET_TRANSACTION_TYPE.TRANSFER_CANCEL_IN,
  WALLET_TRANSACTION_TYPE.PIGGY_BANK_DEPOSIT
])

const TYPE_LABELS = {
  [WALLET_TRANSACTION_TYPE.CHARGE]: '지갑 충전',
  [WALLET_TRANSACTION_TYPE.CHARGE_CANCEL]: '충전 취소',
  [WALLET_TRANSACTION_TYPE.PAYMENT]: '결제',
  [WALLET_TRANSACTION_TYPE.PAYMENT_CANCEL]: '결제 환불',
  [WALLET_TRANSACTION_TYPE.TRANSFER_OUT]: '보낸 송금',
  [WALLET_TRANSACTION_TYPE.TRANSFER_IN]: '받은 송금',
  [WALLET_TRANSACTION_TYPE.TRANSFER_CANCEL_OUT]: '송금 취소 반환',
  [WALLET_TRANSACTION_TYPE.TRANSFER_CANCEL_IN]: '받은 송금 취소',
  [WALLET_TRANSACTION_TYPE.PIGGY_BANK_DEPOSIT]: '저금통 입금',
  [WALLET_TRANSACTION_TYPE.PIGGY_BANK_WITHDRAWAL]: '저금통 반환'
}

const STATUS_ACTION_LABELS = {
  [WALLET_TRANSACTION_TYPE.CHARGE]: '충전',
  [WALLET_TRANSACTION_TYPE.CHARGE_CANCEL]: '취소',
  [WALLET_TRANSACTION_TYPE.PAYMENT]: '결제',
  [WALLET_TRANSACTION_TYPE.PAYMENT_CANCEL]: '환불',
  [WALLET_TRANSACTION_TYPE.TRANSFER_OUT]: '송금',
  [WALLET_TRANSACTION_TYPE.TRANSFER_IN]: '입금',
  [WALLET_TRANSACTION_TYPE.TRANSFER_CANCEL_OUT]: '반환',
  [WALLET_TRANSACTION_TYPE.TRANSFER_CANCEL_IN]: '취소',
  [WALLET_TRANSACTION_TYPE.PIGGY_BANK_DEPOSIT]: '입금',
  [WALLET_TRANSACTION_TYPE.PIGGY_BANK_WITHDRAWAL]: '반환'
}

const BANK_NAMES = {
  '004': 'KB국민은행',
  '011': 'NH농협은행',
  '020': '우리은행',
  '081': '하나은행',
  '088': '신한은행',
  '090': '카카오뱅크',
  '092': '토스뱅크',
  AVOCADO: '아보카도 은행',
  KB: 'KB국민은행',
  NH: 'NH농협은행',
  WOORI: '우리은행',
  HANA: '하나은행',
  SHINHAN: '신한은행',
  KAKAO: '카카오뱅크',
  TOSS: '토스뱅크'
}

const MERCHANT_CATEGORY_LABELS = {
  CONVENIENCE_STORE: '편의점',
  BOOKSTORE: '서점'
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === '') return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function toText(value) {
  return String(value ?? '').trim()
}

export function normalizeWalletTransaction(item) {
  if (
    !item ||
    typeof item !== 'object' ||
    item.transactionId === null ||
    item.transactionId === undefined
  ) {
    return null
  }

  if (!String(item.transactionId).trim()) return null

  const transactionType = toText(item.transactionType).toUpperCase()
  if (!transactionType) return null

  const amount = toNullableNumber(item.amount)

  return {
    id: item.transactionId,
    transactionId: item.transactionId,
    transactionType,
    amount: amount === null ? null : Math.abs(amount),
    counterpartyName: toText(item.counterpartyName),
    status: toText(item.status).toUpperCase(),
    createdAt: item.createdAt ?? '',
    traceId: toText(item.traceId),
    targetBankCode: toText(item.targetBankCode),
    targetAccountNumber: toText(item.targetAccountNumber),
    memo: toText(item.memo),
    failureCode: toText(item.failureCode),
    ledgerType: toText(item.ledgerType).toUpperCase(),
    balanceBefore: toNullableNumber(item.balanceBefore),
    balanceAfter: toNullableNumber(item.balanceAfter),
    merchantCategory: toText(item.merchantCategory)
  }
}

export function isFailedPayment(transaction) {
  return (
    transaction?.transactionType === WALLET_TRANSACTION_TYPE.PAYMENT &&
    transaction?.status === 'FAILED'
  )
}

export function isDisplayableWalletTransaction(transaction) {
  return Boolean(transaction) && !isFailedPayment(transaction)
}

export function isRecentWalletTransaction(transaction) {
  return (
    isDisplayableWalletTransaction(transaction) &&
    RECENT_TRANSACTION_TYPES.has(transaction.transactionType)
  )
}

export function getWalletTransactionDirection(transaction) {
  if (transaction?.ledgerType === 'IN' || transaction?.ledgerType === 'OUT') {
    return transaction.ledgerType
  }

  if (IN_TRANSACTION_TYPES.has(transaction?.transactionType)) return 'IN'
  if (OUT_TRANSACTION_TYPES.has(transaction?.transactionType)) return 'OUT'
  return ''
}

export function getWalletTransactionTypeLabel(transaction) {
  return TYPE_LABELS[transaction?.transactionType] ?? '기타 거래'
}

export function getWalletTransactionTitle(transaction) {
  const counterpartyName = toText(transaction?.counterpartyName)

  if (counterpartyName) {
    if (transaction.transactionType === WALLET_TRANSACTION_TYPE.TRANSFER_OUT) {
      return `${counterpartyName}에게 송금`
    }

    if (transaction.transactionType === WALLET_TRANSACTION_TYPE.TRANSFER_IN) {
      return `${counterpartyName}에게 받은 송금`
    }

    return counterpartyName
  }

  return getWalletTransactionTypeLabel(transaction)
}

export function getWalletTransactionStatusLabel(transaction) {
  const action = STATUS_ACTION_LABELS[transaction?.transactionType] ?? '거래'

  if (transaction?.status === 'SUCCESS') return `${action} 완료`
  if (transaction?.status === 'PENDING') return `${action} 처리 중`
  if (transaction?.status === 'FAILED') return `${action} 실패`
  return '상태 미확인'
}

export function getWalletTransactionStatusClass(transaction) {
  if (transaction?.status === 'PENDING') return 'bg-amber-50 text-amber-700'
  if (transaction?.status === 'FAILED') return 'bg-red-50 text-red-600'
  if (transaction?.status === 'SUCCESS') return 'bg-avocado-100 text-avocado-900'
  return 'bg-gray-100 text-gray-500'
}

export function formatWalletMoney(value) {
  const number = toNullableNumber(value)
  return number === null ? '-' : `${Math.abs(number).toLocaleString('ko-KR')}원`
}

export function formatWalletTransactionAmount(transaction) {
  if (transaction?.amount === null || transaction?.amount === undefined) return '금액 정보 없음'

  let prefix = ''
  if (transaction.status === 'SUCCESS') {
    const direction = getWalletTransactionDirection(transaction)
    if (direction === 'IN') prefix = '+'
    if (direction === 'OUT') prefix = '-'
  }

  return `${prefix}${Number(transaction.amount).toLocaleString('ko-KR')}원`
}

export function getWalletTransactionAmountClass(transaction) {
  if (transaction?.status === 'PENDING') return 'text-amber-600'
  if (transaction?.status !== 'SUCCESS') return 'text-gray-400'

  const direction = getWalletTransactionDirection(transaction)
  if (direction === 'IN') return 'text-avocado-600'
  if (direction === 'OUT') return 'text-red-500'
  return 'text-gray-700'
}

export function formatWalletTransactionDate(value, style = 'relative') {
  if (!value) return '거래 일시 정보 없음'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '거래 일시 정보 없음'

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

  if (style === 'full') {
    return `${year}. ${String(month).padStart(2, '0')}. ${String(day).padStart(2, '0')}. ${time}`
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDate = new Date(year, date.getMonth(), day)
  const dayDifference = Math.round((today.getTime() - targetDate.getTime()) / 86400000)

  if (dayDifference === 0) return `오늘 ${time}`
  if (dayDifference === 1) return `어제 ${time}`
  if (year === now.getFullYear()) return `${month}월 ${day}일 ${time}`

  return `${year}. ${month}. ${day}. ${time}`
}

export function getBankName(bankCode) {
  const code = toText(bankCode).toUpperCase()
  return BANK_NAMES[code] ?? code
}

export function maskAccountNumber(accountNumber) {
  const value = toText(accountNumber).replace(/[\s-]/g, '')
  if (!value) return ''
  if (value.length <= 4) return value
  return `•••• ${value.slice(-4)}`
}

export function getMerchantCategoryLabel(category) {
  const value = toText(category).toUpperCase()
  if (!value) return ''
  return MERCHANT_CATEGORY_LABELS[value] ?? value.replaceAll('_', ' ')
}
