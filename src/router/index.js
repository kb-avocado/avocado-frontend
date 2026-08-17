import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSignupStore } from '@/stores/signup'
import { useTransferStore } from '@/stores/transfer'
import {
  isFamilyConnectRoute,
  isGuestOnlyRoute,
  isOnboardingRoute,
  isPublicRoute,
  resolveHomeRoute,
  resolveLandingRoute,
  resolveOnboardingRoute,
  restoreFamilyRequest
} from './landing'

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
        path: 'terms',
        name: 'signup-terms',
        component: () => import('@/views/auth/common/SignupTermsView.vue'),
        beforeEnter: () => {
          const signupStore = useSignupStore()
          // 아이인지 보호자인지에 따라 보여줄 약관이 달라진다
          if (!signupStore.type) return { name: 'signup-role' }
        }
      },
      {
        path: 'profile',
        name: 'signup-profile',
        component: () => import('@/views/auth/common/SignupProfileView.vue'),
        beforeEnter: () => {
          const signupStore = useSignupStore()
          // role 선택 없이 직접 URL 접근 차단
          if (!signupStore.type) return { name: 'signup-role' }
          // 약관 동의 없이 직접 URL 접근 차단
          if (!signupStore.agreed) return { name: 'signup-terms' }
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
    path: '/parent/:childId?/home',
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
    path: '/parent/:childId?/newspaper',
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
    meta: { title: '맛있는 과카몰리 리포트' }
  },
  {
    path: '/parent/:childId?/report',
    name: 'parent-report',
    component: () => import('@/views/report/parent/ReportView.vue'),
    props: true,
    meta: { title: '맛있는 과카몰리 리포트', audience: 'parent', menu: 'report' }
  },

  // 송금
  {
    path: '/transfer',
    name: 'transfer',
    redirect: { name: 'transfer-recipient' }
  },
  // 보호자 용돈 보내기 (보호자 계좌 -> 아이 선불지갑)
  {
    path: '/parent/:childId/transfer',
    name: 'parent-transfer',
    component: () => import('@/views/transfer/parent/ParentTransferView.vue'),
    props: true,
    meta: {
      title: '용돈 보내기',
      showBack: true,
      audience: 'parent',
      menu: 'transfer'
    }
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
    meta: { title: '티끌모아 태산! 아보카도 저금통', menu: 'piggy', audience: 'child' }
  },
  /* 저금통 목록 (부모) */
  {
    path: '/parent/:childId?/piggy',
    name: 'parent-piggy-list',
    component: () => import('@/views/piggy/parent/ParentPiggyBankListView.vue'),
    props: true,
    meta: { title: '티끌모아 태산! 아보카도 저금통', audience: 'parent', menu: 'piggy' }
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
    meta: { hideLayout: true, title: '보냈던 응원 보기', cheerDeletable: true, audience: 'parent' }
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
 * 로그인하지 않은 접근은 모두 로그인 화면으로 보낸다.
 * 가입 절차가 남은(PENDING) 계정은 남은 연결 화면 밖으로 나가지 못하게 막는다.
 *
 * 갈 화면을 정하는 규칙은 landing.js에 모여 있다.
 */
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  await authStore.restore()

  const user = authStore.user

  // 로그인한 사람이 로그인·회원가입 화면에 오면 계정 상태에 맞는 화면으로 되돌린다.
  if (user && isGuestOnlyRoute(to)) {
    return resolveLandingRoute(user)
  }

  if (isPublicRoute(to)) return

  if (!user) {
    return { name: 'login' }
  }

  // 가입 절차가 끝나지 않았으면 남은 연결 화면에만 머물 수 있다.
  if (user.status === 'PENDING' && !isOnboardingRoute(to)) {
    return resolveOnboardingRoute(user)
  }

  // 새로고침하면 메모리의 스토어가 비어 대기 화면이 진행 중인 요청을 잃는다.
  // 화면을 옮기지는 않고 요청 ID만 다시 심어준다.
  if (user.status === 'PENDING' && isFamilyConnectRoute(to)) {
    restoreFamilyRequest(user)
  }

  // 연결을 마친 아이가 가족 연결 화면으로 되돌아오면 홈으로 보낸다.
  // 다시 요청하면 서버가 이미 연결됐다며 막는다.
  if (user.status !== 'PENDING' && isFamilyConnectRoute(to)) {
    return resolveHomeRoute(user)
  }

  // 로그인·회원가입 화면이 홈으로만 밀어넣고 나머지를 여기 맡긴다.
  if (user.type === 'PARENT' && to.name === 'home') {
    return resolveHomeRoute(user)
  }
})

export default router
