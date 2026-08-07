import { createRouter, createWebHistory } from 'vue-router'
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
    path: '/home',
    name: 'home',
    component: () => import('@/views/home/common/HomeView.vue'),
    meta: { title: '아보카도 홈' }
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
    path: '/home',
    name: 'home',
    component: () => import('@/views/home/common/HomeView.vue'),
    meta: { title: '아보카도 홈' }
  },
  {
    path: '/wallet',
    name: 'wallet',
    component: () => import('@/views/wallet/child/walletView.vue'),
    meta: { title: '결제하기' }
  },
  //신문
  {
    path: '/newspaper',
    name: 'newspaper',
    component: () => import('@/views/news/common/NewspaperView.vue'),
    meta: { title: '경제가 쏙쏙! 아보카도 신문' }
  },
  {
    path: '/child/newspaper/:newsId',
    name: 'newspaper-detail',
    component: () => import('@/views/news/child/NewsDetailView.vue'),
    meta: { title: '신문', showBack: true }
  },
  {
    path: '/parent/newspaper/:newsId',
    name: 'parent-newspaper-detail',
    component: () => import('@/views/news/parent/NewsDetailView.vue'),
    meta: { title: '신문', showBack: true }
  },
  {
    path: '/report',
    name: 'report',
    component: () => import('@/views/report/common/ReportView.vue'),
    meta: { title: '과카몰리 리포트' }
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

  /* 저금통 목록 */
  {
    path: '/piggy',
    alias: '/piggy-banks',
    name: 'piggy',
    component: () => import('@/views/piggy/common/PiggyView.vue'),
    meta: {
      title: '저금통',
      menu: 'piggy',
      audience: 'child'
    }
  },
  {
    path: '/parent/children/:childId/piggy-banks',
    name: 'parent-piggy-list',
    component: () => import('@/views/piggy/parent/ParentPiggyBankListView.vue'),
    props: true,
    meta: {
      title: '저금통',
      menu: 'piggy',
      audience: 'parent'
    }
  },
  //  저금통 생성
  {
    path: '/piggy/new',
    name: 'piggyCreate',
    component: () => import('@/views/piggy/child/PiggyCreateView.vue'),
    meta: { hideLayout: true, title: '새 저금 목표' }
  },
  //저금통 부모 상세
  {
    path: '/piggy/:id',
    name: 'piggyDetail',
    component: () => import('@/views/piggy/parent/PiggyDetailView.vue'),
    meta: { hideLayout: true, title: '저금통 부모 상세' }
  },
  //저금통 저축하기
  {
    path: '/child/piggy/:id/deposit',
    name: 'piggyDeposit',
    component: () => import('@/views/piggy/child/PiggyDepositView.vue'),
    meta: { hideLayout: true, title: '저금하기' }
  },

  // 저금통 아이 상세
  {
    path: '/piggy/:id/child',
    name: 'piggyChildDetail',
    component: () => import('@/views/piggy/child/ChildPiggyDetailView.vue'),
    meta: { hideLayout: true, title: '저금통 아이 상세' }
  },

  // 저금통 보너스 및 응원
  {
    path: '/parent/piggy/:id/bonus',
    name: 'piggyBonus',
    component: () => import('@/views/piggy/parent/PiggyBonusSetupView.vue'),
    meta: { hideLayout: true, title: '보너스 설정하기' }
  },
  {
    path: '/child/piggy/:id/cheer-messages',
    name: 'piggyCheerMessages',
    component: () => import('@/views/piggy/common/PiggyCheerMessageListView.vue'),
    meta: { hideLayout: true, title: '부모님 응원 보기', cheerDeletable: false }
  },
  {
    path: '/parent/piggy/:id/cheer-messages/manage',
    name: 'piggyCheerMessagesManage',
    component: () => import('@/views/piggy/common/PiggyCheerMessageListView.vue'),
    meta: { hideLayout: true, title: '부모님 응원 보기', cheerDeletable: true }
  },
  {
    path: '/parent/piggy/:id/cheer-messages/new',
    name: 'piggyCheerCompose',
    component: () => import('@/views/piggy/parent/PiggyCheerMessageComposeView.vue'),
    meta: { hideLayout: true, title: '응원 보내기' }
  },
  {
    path: '/parent/piggy/:id/complete',
    name: 'piggyGoalComplete',
    component: () => import('@/views/piggy/parent/PiggyGoalCompleteView.vue'),
    meta: { hideLayout: true, title: '저금통' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// TODO: 로그인 기능 붙이면 아래처럼 인증 가드 원복
// import { useAuthStore } from '@/stores/auth'
// router.beforeEach((to) => {
//   const authStore = useAuthStore()
//   if (to.meta.requiresAuth && !authStore.isAuthenticated) {
//     return { name: 'login', query: { redirect: to.fullPath } }
//   }
// })

export default router
