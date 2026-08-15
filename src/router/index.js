import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSignupStore } from '@/stores/signup'
import { useTransferStore } from '@/stores/transfer'

const routes = [
  {
    path: '/',
    name: 'splash',
    component: () => import('@/views/SplashView.vue'),
    meta: { hideLayout: true }
  },

  // 로그인, 회원가입
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/common/LoginView.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/signup',
    children: [
      {
        path: 'role',
        name: 'signup-role',
        component: () => import('@/views/auth/common/SignupRoleView.vue')
      },
      {
        path: 'profile',
        name: 'signup-profile',
        component: () => import('@/views/auth/common/SignupProfileView.vue'),
        beforeEnter: () => {
          const signupStore = useSignupStore()
          // role 선택 없이 직접 URL 접근 차단
          if (!signupStore.type) return { name: 'signup-role' }
        }
      }
    ],
    meta: { hideLayout: true }
  },

  // 계좌 등록
  {
    path: '/account/connect',
    name: 'account-connect',
    component: () => import('@/views/auth/parent/AccountConnectionView.vue'),
    meta: { hideLayout: true }
  },
  // 홈 (아이 / 부모 분리)
  {
    path: '/child/home',
    name: 'home',
    component: () => import('@/views/home/child/HomeView.vue'),
    meta: { title: '아보카도 홈' }
  },
  {
    path: '/parent/:childId/home',
    name: 'parent-home',
    component: () => import('@/views/home/parent/HomeView.vue'),
    props: true,
    meta: { title: '아보카도 홈', audience: 'parent', menu: 'home' }
  },
  // 가족 연결
  {
    path: '/family',
    children: [
      {
        // 아이: 코드 입력
        path: 'connect',
        name: 'family-connect',
        component: () => import('@/views/family/child/FamilyCodeInputView.vue')
      },
      {
        // 아이: 승인 대기/완료 화면
        path: 'pending',
        name: 'family-pending',
        component: () => import('@/views/family/child/FamilyPendingView.vue')
      },
      {
        path: 'check/:requestId',
        name: 'family-check',
        component: () => import('@/views/family/parent/FamilyCheckView.vue')
      }
    ],
    meta: { hideLayout: true }
  },

  // 하단 네비게이션 바 5개 탭
  {
    path: '/child/wallet',
    name: 'wallet',
    component: () => import('@/views/wallet/child/walletView.vue'),
    meta: { title: '결제하기' }
  },
  //신문
  //아이용 신문 리스트화면
  {
    path: '/child/newspaper',
    name: 'newspaper',
    component: () => import('@/views/news/child/NewspaperView.vue'),
    meta: { title: '경제가 쏙쏙! 아보카도 신문' }
  },
  //아이용 신문 세부화면
  {
    path: '/child/newspaper/:newsId',
    name: 'newspaper-detail',
    component: () => import('@/views/news/child/NewsDetailView.vue'),
    meta: { title: '신문', showBack: true }
  },
  {
    //부모용 신문 리스트화면
    path: '/parent/:childId/newspaper',
    name: 'parent-newspaper',
    component: () => import('@/views/news/parent/NewspaperListView.vue'),
    props: true,
    meta: { title: '경제가 쏙쏙! 아보카도 신문', audience: 'parent', menu: 'newspaper' }
  },
  //부모용 신문 세부화면
  {
    path: '/parent/:childId/newspaper/:newsId',
    name: 'parent-newspaper-detail',
    component: () => import('@/views/news/parent/NewsDetailView.vue'),
    props: true,
    meta: { title: '신문', showBack: true, audience: 'parent' }
  },
  //리포트
  {
    path: '/child/report',
    name: 'child-report',
    component: () => import('@/views/report/child/ReportView.vue'),
    meta: { title: '과카몰리 리포트' }
  },
  {
    path: '/parent/:childId/report',
    name: 'parent-report',
    component: () => import('@/views/report/parent/ReportView.vue'),
    props: true, // ← 이 줄이 있는지 확인
    meta: { title: '과카몰리 리포트', audience: 'parent', menu: 'report' }
  },

  // 송금
  {
    path: '/transfer',
    name: 'transfer',
    redirect: { name: 'transfer-recipient' }
  },
  {
    path: '/transfer/recipient',
    name: 'transfer-recipient',
    component: () => import('@/views/transfer/common/TransferRecipientView.vue'),
    meta: {
      title: '송금하기',
      showBack: true
    }
  },
  {
    path: '/transfer/amount',
    name: 'transfer-amount',
    component: () => import('@/views/transfer/common/TransferAmountView.vue'),
    beforeEnter: () => {
      const transferStore = useTransferStore()
      if (!transferStore.recipient) return { name: 'transfer-recipient' }
    },
    meta: {
      title: '송금하기',
      showBack: true
    }
  },

  /* 저금통 목록(아이) */
  {
    path: '/child/piggy',
    name: 'piggy',
    component: () => import('@/views/piggy/common/PiggyView.vue'),
    meta: { title: '저금통', menu: 'piggy', audience: 'child' }
  },
  /* 저금통 목록 (부모) */
  {
    path: '/parent/:childId/piggy',
    name: 'parent-piggy-list',
    component: () => import('@/views/piggy/parent/ParentPiggyBankListView.vue'),
    props: true,
    meta: { title: '저금통', menu: 'piggy', audience: 'parent' }
  },
  /* 저금통 생성 (아이) */
  {
    path: '/child/piggy/new',
    name: 'piggyCreate',
    component: () => import('@/views/piggy/child/PiggyCreateView.vue'),
    meta: { hideLayout: true, title: '새 저금 목표', audience: 'child' }
  },
  /* 저금통 상세 (아이) */
  {
    path: '/child/piggy/:id',
    name: 'piggyChildDetail',
    component: () => import('@/views/piggy/child/ChildPiggyDetailView.vue'),
    meta: { hideLayout: true, title: '저금통 아이 상세', audience: 'child' }
  },
  /* 저금통 상세 (부모) */
  {
    path: '/parent/:childId/piggy/:id',
    name: 'piggyDetail',
    component: () => import('@/views/piggy/parent/PiggyDetailView.vue'),
    props: true,
    meta: { hideLayout: true, title: '저금통 부모 상세', audience: 'parent' }
  },
  //저금통 저축하기
  {
    path: '/child/piggy/:id/deposit',
    name: 'piggyDeposit',
    component: () => import('@/views/piggy/child/PiggyDepositView.vue'),
    meta: { hideLayout: true, title: '저금하기' }
  },

  // 저금통 보너스 및 응원
  {
    path: '/parent/:childId/piggy/:id/bonus',
    name: 'piggyBonus',
    component: () => import('@/views/piggy/parent/PiggyBonusSetupView.vue'),
    meta: { hideLayout: true, title: '보너스 설정하기', audience: 'parent' }
  },
  {
    path: '/child/piggy/:id/cheer-messages',
    name: 'piggyCheerMessages',
    component: () => import('@/views/piggy/common/PiggyCheerMessageListView.vue'),
    meta: { hideLayout: true, title: '부모님 응원 보기', cheerDeletable: false }
  },
  {
    path: '/parent/:childId/piggy/:id/cheer-messages/manage',
    name: 'piggyCheerMessagesManage',
    component: () => import('@/views/piggy/common/PiggyCheerMessageListView.vue'),
    meta: { hideLayout: true, title: '부모님 응원 보기', cheerDeletable: true, audience: 'parent' }
  },
  {
    path: '/parent/:childId/piggy/:id/cheer-messages/new',
    name: 'piggyCheerCompose',
    component: () => import('@/views/piggy/parent/PiggyCheerMessageComposeView.vue'),
    meta: { hideLayout: true, title: '응원 보내기', audience: 'parent' }
  },
  {
    path: '/parent/:childId/piggy/:id/complete',
    name: 'piggyGoalComplete',
    component: () => import('@/views/piggy/parent/PiggyGoalCompleteView.vue'),
    meta: { hideLayout: true, title: '저금통', audience: 'parent' }
  },

  // 마이페이지
  {
    path: '/parent/mypage',
    name: 'mypageParent',
    component: () => import('@/views/mypage/parent/MyPageParentView.vue'),
    meta: { title: '부모 마이페이지' }
  },
  {
    path: '/child/mypage',
    name: 'mypageChild',
    component: () => import('@/views/mypage/child/MyPageChildView.vue'),
    meta: { title: '아이 마이페이지' }
  },

  // 알림 페이지
  {
    path: '/child/notifications',
    name: 'childNotifications',
    component: () => import('@/views/notification/NotificationListView.vue'),
    meta: { hideLayout: true, title: '알림', audience: 'child' }
  },
  {
    path: '/parent/notifications',
    name: 'parentNotifications',
    component: () => import('@/views/notification/NotificationListView.vue'),
    meta: { hideLayout: true, title: '알림', audience: 'parent' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

/* 인증 가드
 *
 * 활성화하면 로그인하지 않은 접근이 모두 로그인 화면으로 간다.
 *
 * TODO: 활성화할 때 함께 고칠 것
 * PENDING 계정이 /login으로 들어오면 홈이 아니라 연결 화면으로 가야 한다. 
 * PENDING 판단을 가드로 몰기
 */

// 로그인하지 않은 사람만 보는 화면. 로그인한 채로 들어오면 홈으로 돌린다.
const GUEST_ONLY_ROUTE_NAMES = ['login', 'signup-role', 'signup-profile']

function isGuestOnlyRoute(to) {
  return GUEST_ONLY_ROUTE_NAMES.includes(to.name) || to.path.startsWith('/signup')
}

// 로그인 없이 볼 수 있는 화면. 여기 없는 화면은 전부 인증이 필요하다.
function isPublicRoute(to) {
  return to.name === 'splash' || isGuestOnlyRoute(to)
}

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  await authStore.restore()

  if (authStore.isAuthenticated && isGuestOnlyRoute(to)) {
    return { name: 'home' }
  }

  if (isPublicRoute(to)) return

  if (!authStore.isAuthenticated) {
    return { name: 'login' }
  }
})

export default router
