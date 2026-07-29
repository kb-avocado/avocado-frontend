import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'splash',
    component: () => import('@/views/SplashView.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/auth/SignupView.vue'),
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
    path: '/piggy',
    name: 'piggy',
    component: () => import('@/views/piggy/PiggyView.vue'),
    meta: { title: '저금통' }
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

  // 저금통
  {
    path: '/piggy/:id',
    name: 'piggyDetail',
    component: () => import('@/views/piggy/PiggyDetailView.vue'),
    meta: { title: '저금통 상세', showBack: true }
  },
  // 저금통 생성
  {
    path: '/piggy/new',
    name: 'piggyCreate',
    component: () => import('@/views/piggy/PiggyCreateView.vue'),
    meta: { hideLayout: true, title: '새 저금 목표' }
  },

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
