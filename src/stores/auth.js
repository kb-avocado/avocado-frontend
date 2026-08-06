import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 화면 표시와 분기에 쓰는 사용자 정보만 둔다.
  // 메모리에만 있어 새로고침하면 사라진다.
  const user = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  function setUser(userInfo) {
    user.value = userInfo
  }

  function clear() {
    user.value = null
  }

  return { user, isAuthenticated, setUser, clear }
})
