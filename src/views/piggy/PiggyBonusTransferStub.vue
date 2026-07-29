<!-- 보너스 파라미터 잘 넘어오는지 확인하려고 테스트 화면 만든거임. 삭제 무방 -->
<template>
    <div class="min-h-screen flex flex-col bg-white">
        <AppHeader title="송금하기 (임시)" show-back :show-bell="false" :show-avatar="false" @click-back="router.back()" />

        <div class="flex-1 p-4 space-y-4">
            <div class="bg-avocado-50 rounded-xl p-4">
                <p class="text-sm font-semibold text-avocado-900 mb-1">⚠️ 테스트용 임시 화면입니다</p>
                <p class="text-xs text-muted leading-relaxed">
                    지금은 이전 화면에서 값이 잘 넘어오는지만 확인하는 용도
                </p>
            </div>

            <div class="rounded-2xl border border-avocado-100 p-4">
                <p class="text-sm text-muted">저금통 id</p>
                <p class="text-base font-medium text-avocado-900 mb-3">{{ route.params.id }}</p>

                <p class="text-sm text-muted">보낼 금액</p>
                <p class="text-2xl font-bold text-avocado-600">{{ amount.toLocaleString('ko-KR') }}원</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'

const route = useRoute()
const router = useRouter()

const amount = computed(() => Number(route.query.amount || 0))
</script>