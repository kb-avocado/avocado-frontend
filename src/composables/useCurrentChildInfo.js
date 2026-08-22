import { computed, ref, watch, unref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getSpendingType } from '@/api/report'
import { getSpendingTypeImage, DEFAULT_SPENDING_TYPE_IMAGE } from '@/constants/spendingTypeImages'

function getLastMonth() {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// 저금통/신문/리포트 탭을 오갈 때마다 새로 조회하면서 기본 이미지로 되돌아갔다가
// 실제 이미지로 바뀌는 깜빡임이 보여서, 한 번 조회한 아이의 이미지는 모듈 스코프에
// 캐싱해 재방문 시 바로 실제 이미지로 시작하도록 한다.
const avatarImageCache = new Map()

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

  const initialCacheKey = String(unref(childId) ?? '')
  const avatarImage = ref(avatarImageCache.get(initialCacheKey) ?? DEFAULT_SPENDING_TYPE_IMAGE)

  async function fetchAvatarImage() {
    const id = unref(childId)
    if (!id) return

    const cacheKey = String(id)
    const cached = avatarImageCache.get(cacheKey)
    if (cached) avatarImage.value = cached

    try {
      const { data } = await getSpendingType(getLastMonth(), id)
      const image = getSpendingTypeImage(data.data?.code)
      avatarImage.value = image
      avatarImageCache.set(cacheKey, image)
    } catch (error) {
      console.error('소비 유형 조회 실패:', error)
      if (!cached) avatarImage.value = DEFAULT_SPENDING_TYPE_IMAGE
    }
  }

  watch(() => unref(childId), fetchAvatarImage, { immediate: true })

  return { name, avatarImage }
}