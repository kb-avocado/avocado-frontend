import { computed, onMounted } from 'vue'
import { usePiggyBankStore } from '@/stores/piggyBank'

/* 저금통 ID 수집 */
export function usePiggyBankDetail(piggyBankId) {
    const store = usePiggyBankStore()

    // 컴포넌트가 실행될 때 한번 진행중/완료 상태 추가
    onMounted(async () => {
        await store.loadChildList('IN_PROGRESS')
        await store.loadChildList('CLOSED')
    })

    // 진행중 혹은 완료, 수집한 저금통의 id와 일치하는 저금통 데이터를 가져옴 (없으면 null)
    const piggyBank = computed(() => {
        const id = Number(piggyBankId)
        return (
            store.getChildList('IN_PROGRESS').find((item) => item.piggyBankId === id) ||
            store.getChildList('CLOSED').find((item) => item.piggyBankId === id) ||
            null
        )
    })

    return { piggyBank }
}