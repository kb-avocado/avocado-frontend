import { ref } from 'vue'

// 라우트 meta.title로는 표현 못하는 "동적 제목"(예: 뉴스 상세의 기사 제목)을
// 화면에서 잠깐 덮어쓰기 위한 공유 상태입니다.
// App.vue가 이 값이 있으면 우선 사용하고, 없으면 route.meta.title을 씁니다.
export const pageTitleOverride = ref(null)

export function usePageTitle() {
  function setPageTitle(title) {
    pageTitleOverride.value = title
  }
  function clearPageTitle() {
    pageTitleOverride.value = null
  }
  return { pageTitleOverride, setPageTitle, clearPageTitle }
}
