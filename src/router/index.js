import { createRouter, createWebHistory } from 'vue-router'
import { useSignupStore } from '@/stores/signup'

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
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/signup',
    children: [
      {
        path: 'role',
        name: 'signup-role',
        component: () => import('@/views/auth/SignupRoleView.vue')
      },
      {
        path: 'profile',
        name: 'signup-profile',
        component: () => import('@/views/auth/SignupProfileView.vue'),
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
    component: () => import('@/views/auth/AccountConnectionView.vue'),
    meta: { hideLayout: true }
  },

  // 하단 네비게이션 바 5개 탭
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/home/HomeView.vue'),
    meta: { title: '아보카도 홈' }
  },
  {
    path: '/wallet',
    name: 'wallet',
    component: () => import('@/views/wallet/WalletView.vue'),
    meta: { title: '결제하기' }
  },
  {
    path: '/newspaper',
    name: 'newspaper',
    component: () => import('@/views/newspaper/NewspaperView.vue'),
    meta: { title: '경제가 쏙쏙! 아보카도 신문' }
  },
  {
    path: '/newspaper/:newsId',
    name: 'newspaper-detail',
    component: () => import('@/views/newspaper/NewsDetailView.vue'),
    meta: { title: '신문', showBack: true }
  },
  {
    path: '/report',
    name: 'report',
    component: () => import('@/views/report/ReportView.vue'),
    meta: { title: '과카몰리 리포트' }
  },

  // 송금
  {
    path: '/transfer',
    name: 'transfer',
    component: () => import('@/views/transfer/TransferView.vue'),
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
    component: () => import('@/views/piggy/PiggyView.vue'),
    meta: {
      title: '저금통',
      menu: 'piggy',
      audience: 'child'
    }
  },
  {
    path: '/parent/children/:childId/piggy-banks',
    name: 'parent-piggy-list',
    component: () => import('@/views/piggy/ParentPiggyBankListView.vue'),
    props: true,
    meta: {
      title: '저금통',
      menu: 'piggy',
      audience: 'parent'
    }
  },
  //저금통 부모 상세
  {
    path: '/piggy/:id',
    name: 'piggyDetail',
    component: () => import('@/views/piggy/PiggyDetailView.vue'),
    meta: { hideLayout: true, title: '저금통 부모 상세' }
  },

  // 저금통 아이 상세
  {
    path: '/piggy/:id/child',
    name: 'piggyChildDetail',
    component: () => import('@/views/piggy/ChildPiggyDetailView.vue'),
    meta: { hideLayout: true, title: '저금통 아이 상세' }
  },

  // 저금통 보너스 및 응원
  {
    path: '/piggy/:id/bonus',
    name: 'piggyBonus',
    component: () => import('@/views/piggy/PiggyBonusSetupView.vue'),
    meta: { hideLayout: true, title: '보너스 설정하기' }
  },
  {
    path: '/piggy/:id/cheer-messages',
    name: 'piggyCheerMessages',
    component: () => import('@/views/piggy/PiggyCheerMessageListView.vue'),
    meta: { hideLayout: true, title: '부모님 응원 보기', cheerDeletable: false }
  },
  {
    path: '/piggy/:id/cheer-messages/manage',
    name: 'piggyCheerMessagesManage',
    component: () => import('@/views/piggy/PiggyCheerMessageListView.vue'),
    meta: { hideLayout: true, title: '부모님 응원 보기', cheerDeletable: true }
  },
  {
    path: '/piggy/:id/cheer-messages/new',
    name: 'piggyCheerCompose',
    component: () => import('@/views/piggy/PiggyCheerMessageComposeView.vue'),
    meta: { hideLayout: true, title: '응원 보내기' }
  },
  {
    path: '/piggy/:id/complete',
    name: 'piggyGoalComplete',
    component: () => import('@/views/piggy/PiggyGoalCompleteView.vue'),
    meta: { hideLayout: true, title: '저금통' }
  },
  // 송금하기 구현 전 임시로 만듬
  {
    path: '/piggy/:id/bonus-transfer',
    name: 'piggyBonusTransferStub',
    component: () => import('@/views/piggy/PiggyBonusTransferStub.vue'),
    meta: { hideLayout: true, title: '송금하기 (임시)' }
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
