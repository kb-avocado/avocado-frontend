import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSignupStore = defineStore('signup', () => {
    const type = ref('')

    function reset() {
        type.value = ''
    }

    return { type, reset }
})