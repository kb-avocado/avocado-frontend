import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'splash',
    component: () => import('@/views/SplashView.vue'),
    meta: {
      hideLayout: true
    }
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      hideLayout: true
    }
  },

  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/auth/SignupView.vue'),
    meta: {
      hideLayout: true
    }
  },

  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/home/HomeView.vue'),
    meta: {
      title: '아보카도',
      menu: 'home',
      audience: 'child'
    }
  },

  /**
   * [아이 저금통 목록 라우트]
   *
   * /piggy
   * /piggy-banks
   */
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

  /**
   * [보호자 저금통 목록 라우트]
   *
   * /parent/children/{childId}/piggy-banks
   */
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

  {
    path: '/wallet',
    name: 'wallet',
    component: () => import('@/views/wallet/WalletView.vue'),
    meta: {
      title: '결제하기',
      menu: 'wallet',
      audience: 'child'
    }
  },

  {
    path: '/newspaper',
    name: 'newspaper',
    component: () => import('@/views/newspaper/' + 'NewspaperView.vue'),
    meta: {
      title: '신문',
      menu: 'newspaper',
      audience: 'child'
    }
  },

  {
    path: '/report',
    name: 'report',
    component: () => import('@/views/report/ReportView.vue'),
    meta: {
      title: '리포트',
      menu: 'report',
      audience: 'child'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
