<template>
    <div class="min-h-screen flex flex-col bg-white">
        <AppHeader title="응원 보내기" show-back :show-bell="false" :show-avatar="false" @click-back="router.back()" />

        <div class="flex-1 p-4 space-y-4">
            <div>
                <p class="text-sm font-medium text-avocado-900 mb-2">응원 메시지 작성</p>
                <textarea v-model="message" :maxlength="MAX_LENGTH" rows="4"
                    placeholder="아이가 저금을 완료할 수 있게 독려의 한 마디를 해주세요!"
                    class="w-full border border-avocado-300 rounded-xl p-3 text-[15px] outline-none resize-none"></textarea>
                <p class="text-xs text-muted text-right mt-1">{{ message.length }}/{{ MAX_LENGTH }}</p>
            </div>

            <div>
                <p class="text-sm font-medium text-avocado-900 mb-2">빠른 응원 문구</p>
                <div class="grid grid-cols-2 gap-2">
                    <button v-for="phrase in quickPhrases" :key="phrase" type="button"
                        class="text-sm text-avocado-600 bg-avocado-50 border border-avocado-100 rounded-full py-2 px-3 hover:bg-avocado-100"
                        @click="selectQuickPhrase(phrase)">
                        {{ phrase }}
                    </button>
                </div>
            </div>

            <p v-if="submitError" class="text-sm text-red-500">{{ submitError }}</p>
        </div>

        <div class="p-4">
            <BaseButton variant="primary" class="w-full" :disabled="!canSubmit" @click="handleSubmit">
                {{ isSubmitting ? '전송 중...' : '보내기' }}
            </BaseButton>
        </div>

        <BottomNavBar />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/* 뒤로가기 버튼을 위한 헤더랑 NAV import */
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BottomNavBar from '@/components/layout/BottomNavBar.vue'

import { sendCheerMessage } from '@/api/piggy'

const route = useRoute()
const router = useRouter()

/* 최대 200자 */
const MAX_LENGTH = 200

/* 퀵 응원 메세지 버튼 */
const quickPhrases = [
    '시작이 반이다!',
    '정말 대단해!!!',
    '항상 응원해~',
    '너무 잘 하고 있어~',
    '대견해 우리 아들',
    '대견해 우리 딸'
]

const message = ref('')
const isSubmitting = ref(false)
const submitError = ref('')

/* 응원 메세지의 내용이 없거나 앞 뒤 공백 확인 */
const canSubmit = computed(() => message.value.trim().length > 0 && !isSubmitting.value)

/* 퀵 메뉴를 누르면 해당 텍스트로 value 값 변경 */
function selectQuickPhrase(phrase) {
    message.value = phrase
}

/* 응원 보내기 함수 */
async function handleSubmit() {
    if (!canSubmit.value) return

    isSubmitting.value = true
    submitError.value = ''
    try {
        await sendCheerMessage(route.params.id, { message: message.value })

        // 응원 메세지 전송 후 목록 화면으로 이동
        router.back()
    } catch (e) {
        submitError.value = '응원 메시지 전송에 실패했어요. 다시 시도해주세요.'
    } finally {
        isSubmitting.value = false
    }
}
</script>