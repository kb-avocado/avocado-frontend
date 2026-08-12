import { defineStore } from 'pinia'
import { piggyBankApi } from '@/api/piggy'
import { useAuthStore } from '@/stores/auth'

/**
 * 진행 중/완료 목록을 분리해서 보관할 기본 상태를 생성합니다.
 */
function createListState() {
  return {
    IN_PROGRESS: [],
    CLOSED: []
  }
}

/**
 * 한 아이에 대한 보호자 목록 상태를 생성합니다.
 */
function createParentState() {
  return {
    lists: createListState(),
    activeCount: 0,
    maxCount: 3,
    canCreate: true
  }
}

/**
 * 백엔드 목록 응답을 프론트에서 안전하게 사용할 수 있게 정리합니다.
 */
function normalizeListResponse(result) {
  const activeCount = Number(result?.activeCount ?? 0)

  const maxCount = Number(result?.maxCount ?? 3)

  return {
    piggyBanks: Array.isArray(result?.piggyBanks) ? result.piggyBanks : [],

    activeCount,
    maxCount,

    canCreate: result?.canCreate == null ? activeCount < maxCount : Boolean(result.canCreate)
  }
}

export const usePiggyBankStore = defineStore('piggyBank', {
  state: () => ({
    /**
     * 아이 목록 상태
     */
    childLists: createListState(),

    childActiveCount: 0,
    childMaxCount: 3,
    childCanCreate: true,

    /**
     * 보호자 화면은 childId별로 목록을 분리해서 저장합니다.
     *
     * 예:
     * parentChildren['2'].lists.IN_PROGRESS
     */
    parentChildren: {},

    detail: null, //추가 : 상세 조회

    loading: false,
    error: ''
  }),

  getters: {
    /**
     * [아이 목록 반환 함수]
     *
     * 사용:
     * store.getChildList('IN_PROGRESS')
     * store.getChildList('CLOSED')
     */
    getChildList: (state) => {
      return (tab) => state.childLists[tab] || []
    },

    /**
     * [보호자 목록 반환 함수]
     *
     * 사용:
     * store.getParentList(childId, tab)
     */
    getParentList: (state) => {
      return (childId, tab) => {
        const childKey = String(childId)

        return state.parentChildren[childKey]?.lists?.[tab] || []
      }
    },

    /**
     * 보호자 화면에서 현재 개수와 최대 개수를 조회합니다.
     */
    getParentState: (state) => {
      return (childId) => {
        const childKey = String(childId)

        return state.parentChildren[childKey] || null
      }
    }
  },

  actions: {
    /**
     * 즐겨찾기 상태를 토글합니다.
     */
    toggleFavorite(piggyBankId) {
      for (const tab of Object.keys(this.childLists)) {
        const target = this.childLists[tab].find(
          (item) => String(item.piggyBankId) === String(piggyBankId)
        )
        if (target) {
          target.favorite = !target.favorite
          // TODO: 백엔드 즐겨찾기 API 생기면 여기서 호출
          return
        }
      }
    },
    /**
     * 보호자가 처음 해당 아이의 목록을 조회할 때
     * 기본 상태를 생성합니다.
     */
    ensureParentState(childId) {
      const childKey = String(childId)

      if (!this.parentChildren[childKey]) {
        this.parentChildren[childKey] = createParentState()
      }

      return this.parentChildren[childKey]
    },

    clearError() {
      this.error = ''
    },

    /**
     * [아이 목록 조회 핵심 함수]
     *
     * 1. piggyBankApi.getChildList() 호출
     * 2. 응답을 IN_PROGRESS 또는 CLOSED 목록에 저장
     * 3. activeCount, maxCount 저장
     */
    async loadChildList(tab = 'IN_PROGRESS') {
      this.loading = true
      this.error = ''

      try {
        const result = await piggyBankApi.getChildList(tab)

        const normalized = normalizeListResponse(result)

        this.childLists[tab] = normalized.piggyBanks

        this.childActiveCount = normalized.activeCount

        this.childMaxCount = normalized.maxCount

        this.childCanCreate = normalized.canCreate

        return normalized
      } catch (error) {
        this.error = error.message || '저금통 목록을 불러오지 못했습니다.'

        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * [보호자 목록 조회 핵심 함수]
     *
     * 1. piggyBankApi.getParentList() 호출
     * 2. childId별로 목록 저장
     * 3. activeCount, maxCount 저장
     */
    async loadParentList(childId, tab = 'IN_PROGRESS') {
      this.loading = true
      this.error = ''

      const parentState = this.ensureParentState(childId)

      try {
        const result = await piggyBankApi.getParentList(childId, tab)

        const normalized = normalizeListResponse(result)

        parentState.lists[tab] = normalized.piggyBanks

        parentState.activeCount = normalized.activeCount

        parentState.maxCount = normalized.maxCount

        parentState.canCreate = normalized.canCreate

        return normalized
      } catch (error) {
        this.error = error.message || '아이의 저금통 목록을 불러오지 못했습니다.'

        throw error
      } finally {
        this.loading = false
      }
    },
    // 추가 : 상세 조회
    async loadDetail(piggyBankId, childId) {
      this.loading = true
      this.error = ''

      try {
        this.detail = await piggyBankApi.getDetail(piggyBankId, childId)

        return this.detail
      } catch (error) {
        this.error = error.message || '저금통 정보를 불러오지 못했습니다.'

        throw error
      } finally {
        this.loading = false
      }
    },
    // 추가: 저금통 생성
    async createPiggyBank(payload) {
      this.loading = true
      this.error = ''

      try {
        return await piggyBankApi.createPiggyBank(payload)
      } catch (error) {
        this.error = error.message || '저금통 생성에 실패했습니다.'

        throw error
      } finally {
        this.loading = false
      }
    },
    // 저금통 중도 포기(삭제)
    async closePiggyBank(piggyBankId) {
      this.loading = true
      this.error = ''
      try {
        await piggyBankApi.closePiggyBank(piggyBankId)
      } catch (error) {
        this.error = error.message || '저금통 삭제에 실패했습니다.'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
