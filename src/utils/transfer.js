export function unwrapTransferResponse(response) {
  const body = response?.data
  return body?.data ?? body
}

/**
 * 백엔드 TransferRecipientResponseDto → 화면에서 쓰는 recipient 객체로 변환
 */
export function normalizeTransferRecipient(data) {
  if (!data || typeof data !== 'object') return null

  const name = data.recipientName
  const accountNumber = data.recipientNumber

  if (!name || !accountNumber) return null

  return {
    name,
    bankCode: data.bankCode ?? '',
    bankName: data.bankName ?? '',
    accountNumber,
    maskedAccountNumber: data.maskedAccountNumber ?? accountNumber
  }
}

export function normalizeRecentTransferRecipients(data) {
  const items = Array.isArray(data) ? data : (data?.items ?? [])

  return items
    .map((item) => normalizeTransferRecipient(item))
    .filter(Boolean)
    .map((recipient, index) => ({
      ...recipient,
      key: `${recipient.accountNumber}-${index}`
    }))
}