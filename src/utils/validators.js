/* 돈 관련 입력값 검증 (송금, 저축) */
export function isValidAmount(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0
}

export function isValidPassword(value) {
  // 최소 8자, 영문+숫자 조합
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value)
}

/* 이자율에 대한 숫자 유효성 검증 */
export function isValidPercentage(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 && n <= 100
}