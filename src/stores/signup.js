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

    function setCode(value) {
        code.value = value
    }

    function clearCode() {
        code.value = ''
    }

    return {
        code,
        setCode,
        clearCode
    }
})