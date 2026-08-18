import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'

const axiosInstance = axios.create({
  // 값을 비워두면 '/api' 상대경로로 나가 vite.config.js의 프록시를 탄다.
  // 그래야 브라우저 입장에서 같은 출처가 되어 CORS 없이 쿠키가 오간다.
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  // 토큰이 HttpOnly 쿠키로 오가므로 쿠키를 함께 실어 보낸다.
  withCredentials: true
})

// 진행 중인 재발급 요청. 여러 요청이 동시에 401을 받아도 재발급은 한 번만 나가야 한다.
// 리프레시 토큰을 두 번 보내면 탈취로 오인해 전 기기가 로그아웃된다.
let refreshRequest = null

function requestRefresh() {
  if (!refreshRequest) {
    refreshRequest = axiosInstance
      .post('/auth/refresh')
      .then((response) => {
        useAuthStore().setUser(response.data.data)

        // 토큰이 만료되면 알림 스트림도 401로 끊긴다. 재발급 전후로 status는 그대로라
        // App.vue의 감시가 반응하지 않으므로, 끊긴 스트림은 여기서 다시 연결한다.
        useNotificationStore().sync(response.data.data)

        return response
      })
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

function goToLogin() {
  useAuthStore().clear()
  useNotificationStore().reset()

  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// 응답 인터셉터: 액세스 토큰이 만료되면 조용히 재발급하고 원래 요청을 다시 보낸다.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config

    if (error.response?.status !== 401 || !request) {
      return Promise.reject(error)
    }

    const url = request.url ?? ''

    if (url.includes('/auth/login')) {
      return Promise.reject(error)
    }

    if (url.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    if (request.retriedAfterRefresh) {
      goToLogin()
      return Promise.reject(error)
    }

    request.retriedAfterRefresh = true

    try {
      await requestRefresh()

      return axiosInstance(request)
    } catch (refreshError) {
      if (!url.includes('/auth/me')) {
        goToLogin()
      }

      return Promise.reject(refreshError)
    }
  }
)

export default axiosInstance
