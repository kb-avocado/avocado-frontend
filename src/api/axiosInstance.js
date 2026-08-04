import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const axiosInstance = axios.create({
  // 값을 비워두면 '/api' 상대경로로 나가 vite.config.js의 프록시를 탄다.
  // 그래야 브라우저 입장에서 같은 출처가 되어 CORS 없이 쿠키가 오간다.
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  // Access Token이 HttpOnly 쿠키로 오가므로 쿠키를 함께 실어 보낸다.
  withCredentials: true
})

// 응답 인터셉터: 인증 만료(401) 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')

    if (error.response?.status === 401 && !isLoginRequest) {
      useAuthStore().clear()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
