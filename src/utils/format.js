export function formatCurrency(amount) {
  return `${new Intl.NumberFormat('ko-KR').format(amount ?? 0)}원`
}

/* 휴대전화 번호 하이픈 포맷 함수 (010-1234-5678)
   서버가 하이픈이 있는 형식만 받으므로 입력 중에 자동으로 넣어준다. */
export function formatPhoneNumber(value) {
  // 사용자가 하이픈을 직접 넣었을 수도 있으니 숫자만 남기고 다시 만든다.
  const digits = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 11)

  if (digits.length < 4) {
    return digits
  }

  if (digits.length < 8) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }

  // 011-123-4567처럼 10자리인 번호는 가운데가 세 자리다.
  const middleEnd = digits.length === 10 ? 6 : 7

  return `${digits.slice(0, 3)}-${digits.slice(3, middleEnd)}-${digits.slice(middleEnd)}`
}


/* 응원 메세지 날짜 (몇 일전) 포맷 함수 */
export function formatMessageTime(dateString) {
  // 파라미터로 받은 날짜 문자열 값을 Date 객체 값으로 변환
  const date = new Date(dateString)

  // 지금의 날짜 값 저장
  const now = new Date()

  // 파라미터 날짜 값 - 지금 날짜 값
  const isToday = date.toDateString() === now.toDateString()

  // 한국식 시간 대로 포맷
  if (isToday) {
    return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })
  }

  // 몇 일전인지 계산
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
  return `${diffDays}일 전`
}