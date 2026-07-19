import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(null)
  const user = ref(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  function setAuth({ token, userInfo }) {
    accessToken.value = token
    user.value = userInfo
  }

  function logout() {
    accessToken.value = null
    user.value = null
  }

  return { accessToken, user, isAuthenticated, setAuth, logout }
})
