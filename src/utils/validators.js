export function isValidAmount(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0
}

export function isValidPassword(value) {
  // 최소 8자, 영문+숫자 조합
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value)
}
