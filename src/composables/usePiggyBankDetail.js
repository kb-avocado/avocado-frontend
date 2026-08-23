import { computed, onMounted } from 'vue'
import { usePiggyBankStore } from '@/stores/piggyBank'

export function usePiggyBankDetail(piggyBankId, childId) {
  const store = usePiggyBankStore()
  const isParent = childId != null

  onMounted(async () => {
    if (isParent) {
      await store.loadParentList(childId, 'IN_PROGRESS')
      await store.loadParentList(childId, 'BONUS_UNPAID')
      await store.loadParentList(childId, 'CLOSED')
    } else {
      await store.loadChildList('IN_PROGRESS')
      await store.loadChildList('BONUS_UNPAID')
      await store.loadChildList('CLOSED')
    }
  })

  const piggyBank = computed(() => {
    const id = Number(piggyBankId)

    if (isParent) {
      return (
        store.getParentList(childId, 'IN_PROGRESS').find((item) => item.piggyBankId === id) ||
        store.getParentList(childId, 'BONUS_UNPAID').find((item) => item.piggyBankId === id) ||
        store.getParentList(childId, 'CLOSED').find((item) => item.piggyBankId === id) ||
        null
      )
    }

    return (
      store.getChildList('IN_PROGRESS').find((item) => item.piggyBankId === id) ||
      store.getChildList('BONUS_UNPAID').find((item) => item.piggyBankId === id) ||
      store.getChildList('CLOSED').find((item) => item.piggyBankId === id) ||
      null
    )
  })

  return { piggyBank }
}
