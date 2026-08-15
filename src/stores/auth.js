import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMe } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // 화면 표시와 분기에 쓰는 사용자 정보만 둔다.
  // 메모리에만 있어 새로고침하면 사라지고, restore()로 되찾는다.
  const user = ref(null)

  // 복원을 이미 시도했는지. 앱을 여는 동안 서버에 한 번만 물어보기 위한 표시다.
  const restored = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  function setUser(userInfo) {
    user.value = userInfo
  }

  function clear() {
    user.value = null
  }

  /**
   * 쿠키의 토큰으로 로그인 정보를 되찾는다.
   *
   * Access Token은 HttpOnly 쿠키라 JS가 읽을 수 없다. 그래서 새로고침 후에는
   * 로그인 여부조차 서버에 물어봐야 알 수 있다.
   * 화면이 그려지기 전에 끝나야 해서 라우터 가드에서 호출한다.
   */
  async function restore() {
    if (restored.value) return

    restored.value = true

    try {
      const { data: response } = await getMe()
      user.value = response.data
    } catch {
      // 토큰이 없거나 만료됐다. 로그인하지 않은 상태로 둔다.
      user.value = null
    }
  }

  return { user, isAuthenticated, setUser, clear, restore }
})
