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

  // 저금통
  {
    path: '/piggy/:id/bonus',
    name: 'piggyBonus',
    component: () => import('@/views/piggy/PiggyBonusSetupView.vue'),
    meta: { hideLayout: true, title: '보너스 설정하기' }
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
