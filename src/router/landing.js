import { useFamilyConnectStore } from '@/stores/signup'

/**
 * 로그인 상태와 계정 상태로 갈 화면을 정하는 규칙을 모아둔다.
 */

// 로그인하지 않은 사람만 보는 화면. 로그인한 채로 들어오면 되돌린다.
export const GUEST_ONLY_ROUTE_NAMES = ['login', 'signup-role', 'signup-profile']

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

/**
 * 가입 절차가 남은(PENDING) 계정이 이어서 밟아야 할 화면.
 * 부모는 계좌 등록, 아이는 가족 연결이며, 아이는 요청이 어디까지 갔는지에 따라 갈 곳이 다르다.
 */
export function resolveOnboardingRoute(user) {
  if (user.type === 'PARENT') {
    return { name: 'account-connect' }
  }

  const familyConnectStore = useFamilyConnectStore()
  const family = user.family

  if (family?.status === 'PENDING' || family?.status === 'APPROVED') {
    // 대기 화면이 새 요청을 만들지 않고 진행 중인 요청을 이어받도록 넘겨준다.
    familyConnectStore.setRequestId(family.requestId)
    return { name: 'family-pending' }
  }

  // 요청이 없거나 거절·취소됐으면 코드부터 다시 입력한다.
  familyConnectStore.clear()
  return { name: 'family-connect' }
}

/**
 * 가입 절차를 마친 계정이 기본으로 볼 화면.
 * 부모 홈은 볼 아이를 정해야 열리므로 연결된 첫 아이를 쓴다.
 */
export function resolveHomeRoute(user) {
  if (user.type !== 'PARENT') {
    return { name: 'home' }
  }

  const firstChildId = user.child?.[0]?.id

  // 아직 연결된 아이가 없으면 childId 없이 홈으로 보낸다. 홈이 빈 화면을 대신 보여준다.
  if (!firstChildId) {
    return { name: 'parent-home' }
  }

  return { name: 'parent-home', params: { childId: firstChildId } }
}

/**
 * 로그인 직후처럼, 계정 상태만 알 때 갈 화면을 고른다.
 */
export function resolveLandingRoute(user) {
  return user.status === 'PENDING' ? resolveOnboardingRoute(user) : resolveHomeRoute(user)
}
