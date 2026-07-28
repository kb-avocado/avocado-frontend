export function formatCurrency(amount) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount ?? 0)
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