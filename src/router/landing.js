import { useFamilyConnectStore } from '@/stores/signup'
import { readLastViewedChildId } from '@/utils/lastViewedChild'

/**
 * 로그인 상태와 계정 상태로 갈 화면을 정하는 규칙을 모아둔다.
 */

// 로그인하지 않은 사람만 보는 화면. 로그인한 채로 들어오면 되돌린다.
export const GUEST_ONLY_ROUTE_NAMES = ['login', 'signup-role', 'signup-terms', 'signup-profile']

// 아이의 가족 연결 화면. 연결을 마치면 다시 들어올 일이 없다.
export const FAMILY_CONNECT_ROUTE_NAMES = ['family-connect', 'family-pending']

// 가입 절차(PENDING)가 남은 계정에게 허용하는 화면.
export const ONBOARDING_ROUTE_NAMES = ['account-connect', ...FAMILY_CONNECT_ROUTE_NAMES]

export function isGuestOnlyRoute(to) {
  return GUEST_ONLY_ROUTE_NAMES.includes(to.name) || to.path.startsWith('/signup')
}

// 로그인 없이 볼 수 있는 화면. 여기 없는 화면은 전부 인증이 필요하다.
export function isPublicRoute(to) {
  return to.name === 'splash' || isGuestOnlyRoute(to)
}

export function isOnboardingRoute(to) {
  return ONBOARDING_ROUTE_NAMES.includes(to.name)
}

export function isFamilyConnectRoute(to) {
  return FAMILY_CONNECT_ROUTE_NAMES.includes(to.name)
}

// 보호자의 응답을 기다리는 중이거나, 아이의 확정만 남은 요청.
function hasRequestInProgress(family) {
  return family?.status === 'PENDING' || family?.status === 'APPROVED'
}

/**
 * 가입 절차가 남은(PENDING) 계정이 이어서 밟아야 할 화면.
 * 부모는 계좌 등록, 아이는 가족 연결이며, 아이는 요청이 어디까지 갔는지에 따라 갈 곳이 다르다.
 */
export function resolveOnboardingRoute(user) {
  if (user.type === 'PARENT') {
    return { name: 'account-connect' }
  }

  const familyConnectStore = useFamilyConnectStore()

  if (hasRequestInProgress(user.family)) {
    // 대기 화면이 새 요청을 만들지 않고 진행 중인 요청을 이어받도록 넘겨준다.
    familyConnectStore.setRequestId(user.family.requestId)
    return { name: 'family-pending' }
  }

  // 요청이 없거나 거절·취소됐으면 코드부터 다시 입력한다.
  familyConnectStore.clear()
  return { name: 'family-connect' }
}

/**
 * 대기 화면이 잃어버린 요청 ID를 다시 심어준다.
 *
 * 보호자 요청 대기/아이 승인 대기 중 새로고침하면 스토어가 비워진다.
 * 서버에 요청이 살아 있는데도 대기 화면이 그것을 찾지 못하고
 * 코드 입력부터 다시 시작하게 된다.
 */
export function restoreFamilyRequest(user) {
  if (user.type === 'PARENT') return

  const familyConnectStore = useFamilyConnectStore()

  // 이미 값이 있으면 건드리지 않는다.
  if (familyConnectStore.requestId) return

  // 코드를 방금 입력하고 들어온 경우다. 새 요청을 보내야 하므로 지난 요청을 집어들지 않는다.
  //
  // user.family는 로그인 시점의 스냅샷이라, 요청을 취소한 뒤에도 한동안 진행 중으로 남아 있다.
  // 그 값을 믿고 요청 ID를 심으면 대기 화면이 새 요청을 보내지 않고 끝난 요청을 이어받아,
  // 코드를 다시 넣어도 곧바로 "취소되었어요"가 뜬다.
  if (familyConnectStore.code) return

  if (!hasRequestInProgress(user.family)) return

  familyConnectStore.setRequestId(user.family.requestId)
}

/**
 * 보호자 화면이 childId 없이 열렸을 때 보여줄 아이.
 *
 * 마지막으로 보던 아이를 이어서 보여준다. 저장된 값이 지금 연결된 아이 목록에 없으면
 * (계정이 바뀌었거나 연결이 끊겼으면) 첫 아이로 돌아간다.
 *
 * @returns 아이 ID. 연결된 아이가 없으면 undefined.
 */
export function resolveParentChildId(user) {
  const children = user?.child ?? []

  if (children.length === 0) return undefined

  const lastViewedId = readLastViewedChildId()
  const lastViewed = children.find((child) => String(child.id) === String(lastViewedId))

  return lastViewed?.id ?? children[0].id
}

/**
 * 가입 절차를 마친 계정이 기본으로 볼 화면.
 * 부모 홈은 볼 아이를 정해야 열린다.
 */
export function resolveHomeRoute(user) {
  if (user.type !== 'PARENT') {
    return { name: 'home' }
  }

  const childId = resolveParentChildId(user)

  // 아직 연결된 아이가 없으면 childId 없이 홈으로 보낸다. 홈이 빈 화면을 대신 보여준다.
  if (!childId) {
    return { name: 'parent-home' }
  }

  return { name: 'parent-home', params: { childId } }
}

/**
 * 로그인 직후처럼, 계정 상태만 알 때 갈 화면을 고른다.
 */
export function resolveLandingRoute(user) {
  return user.status === 'PENDING' ? resolveOnboardingRoute(user) : resolveHomeRoute(user)
}
