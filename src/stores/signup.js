import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSignupStore = defineStore('signup', () => {
    const type = ref('')

    function reset() {
        type.value = ''
    }

    return { type, reset }
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