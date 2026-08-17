import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSignupStore = defineStore('signup', () => {
  const type = ref('')

  // 필수 약관에 모두 동의했는지. 서버로 보내지는 않고 다음 화면으로 넘어가는 조건으로만 쓴다.
  const agreed = ref(false)

  // 역할을 다시 고르면 보여줄 약관이 달라진다(아이는 법정 대리인 동의가 붙는다).
  function setType(value) {
    type.value = value
    agreed.value = false
  }

  function setAgreed(value) {
    agreed.value = value
  }

  function reset() {
    type.value = ''
    agreed.value = false
  }

  return { type, agreed, setType, setAgreed, reset }
})

export const useFamilyConnectStore = defineStore('familyConnect', () => {
  const code = ref('')

  // 재로그인처럼 이미 진행 중인 요청을 이어받아야 할 때 쓴다.
  // 값이 있으면 대기 화면이 새 요청을 만들지 않고 이 요청을 폴링한다.
  const requestId = ref(null)

  function setCode(value) {
    code.value = value
  }

  function setRequestId(value) {
    requestId.value = value
  }

  function clear() {
    code.value = ''
    requestId.value = null
  }

  return {
    code,
    requestId,
    setCode,
    setRequestId,
    clear
  }
})