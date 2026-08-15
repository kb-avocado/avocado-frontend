import { computed, ref, watch, unref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getSpendingType } from '@/api/report'
import { getSpendingTypeImage, DEFAULT_SPENDING_TYPE_IMAGE } from '@/constants/spendingTypeImages'

function getLastMonth() {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// 부모 화면 상단에 "지금 보고 있는 아이가 누구인지" 고정으로 보여주기 위한 이름 + 캐릭터 이미지.
// 저금통 리스트 / 신문 리스트 / 리포트 화면(네비바 탭 진입 화면)에서 공통으로 쓴다.
// childId는 ref든 일반 값이든 둘 다 받는다.
export function useCurrentChildInfo(childId) {
  const authStore = useAuthStore()
  const children = computed(() => authStore.user?.child ?? [])

  const name = computed(
    () =>
      children.value.find((child) => String(child.id) === String(unref(childId)))?.name ?? '아이'
  )

  const avatarImage = ref(DEFAULT_SPENDING_TYPE_IMAGE)

  async function fetchAvatarImage() {
    const id = unref(childId)
    if (!id) return

    try {
      const { data } = await getSpendingType(getLastMonth(), id)
      avatarImage.value = getSpendingTypeImage(data.data?.code)
    } catch (error) {
      console.error('소비 유형 조회 실패:', error)
      avatarImage.value = DEFAULT_SPENDING_TYPE_IMAGE
    }
  }

  watch(() => unref(childId), fetchAvatarImage, { immediate: true })

  return { name, avatarImage }
}