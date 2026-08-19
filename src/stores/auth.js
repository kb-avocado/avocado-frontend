import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMe } from '@/api/auth'
import { clearLastViewedChildId } from '@/utils/lastViewedChild'

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

    // 다음 사용자가 남의 아이를 기본값으로 물려받지 않도록 지운다.
    clearLastViewedChildId()
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
      // 토큰이 없거나 만료됐다. 로그아웃과 같은 상태로 되돌린다.
      clear()
    }
  }

  /**
   * 서버에서 로그인 정보를 다시 받아온다.
   *
   * restore()는 앱을 여는 동안 한 번만 물어보지만, 가족 연결이나 계좌 등록처럼
   * 서버가 계정 상태를 바꾸는 시점에는 그때그때 다시 받아와야 한다.
   *
   * 실패해도 user를 비우지 않는다. 여기서의 실패는 로그아웃이 아니라 갱신 실패라
   * 어떻게 처리할지는 부른 쪽이 정한다.
   */
  async function refresh() {
    try {
      const { data: response } = await getMe()
      user.value = response.data
      restored.value = true
    } catch (error) {
      // 실패한 채로 두면 낡은 정보가 그대로 굳는다.
      // 복원 표시를 지워 다음 화면 이동 때 가드의 restore()가 다시 물어보게 한다.
      restored.value = false
      throw error
    }
  }

  return { user, isAuthenticated, setUser, clear, restore, refresh }
})
