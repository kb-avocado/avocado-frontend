/**
 * 보호자가 마지막으로 보던 아이를 기억한다.
 */

const STORAGE_KEY = 'avocado.lastViewedChildId'

export function readLastViewedChildId() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    // 사생활 보호 모드 등으로 저장소를 못 읽어도 기본값으로 돌아갈 뿐이다.
    return ''
  }
}

export function writeLastViewedChildId(childId) {
  try {
    localStorage.setItem(STORAGE_KEY, String(childId))
  } catch {
    // 저장에 실패해도 화면 동작을 막지 않는다.
  }
}

export function clearLastViewedChildId() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 지우지 못해도 다음 사용자에게는 아이 목록 확인에서 걸러진다.
  }
}
