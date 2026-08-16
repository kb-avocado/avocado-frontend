import axiosInstance from '@/api/axiosInstance'

/**
 * Spring ApiResponse의 data를 꺼냅니다.
 */
function unwrapResponse(response) {
  const body = response.data

  if (body?.success === false) {
    const error = new Error(body.error?.message || '요청을 처리하지 못했습니다.')

    error.code = body.error?.code
    error.isBusinessError = true

    throw error
  }

  return body?.data ?? body
}

/**
 * Axios 오류 메시지를 변환합니다.
 */
function getErrorMessage(error) {
  if (!error.response) {
    return '서버에 연결할 수 없습니다. 백엔드 실행 상태를 확인해 주세요.'
  }

  return (
    error.response.data?.error?.message ||
    error.response.data?.message ||
    error.message ||
    '요청을 처리하지 못했습니다.'
  )
}

/**
 * 실제 Spring 백엔드 요청을 처리합니다.
 */
async function request(config) {
  try {
    const response = await axiosInstance(config)

    return unwrapResponse(response)
  } catch (error) {
    if (error.isBusinessError) {
      throw error
    }

    const requestError = new Error(getErrorMessage(error))

    requestError.code = error.response?.data?.error?.code || error.code

    requestError.status = error.response?.status

    throw requestError
  }
}

export const piggyBankApi = {
  /**
   * [아이 목록 조회 핵심 함수]
   * GET /api/piggy-banks
   */
  async getChildList(tab = 'IN_PROGRESS') {
    return request({
      method: 'GET',
      url: '/piggybanks', // piggy-banks → piggybanks
      params: {
        status: tab // tab → status
      }
    })
  },

  /**
   * [보호자 목록 조회 핵심 함수]
   * GET /api/parent/children/{childId}/piggy-banks
   */
  async getParentList(childId, tab = 'IN_PROGRESS') {
    return request({
      method: 'GET',
      url: '/piggybanks', //  공통 엔드포인트로 변경
      params: {
        status: tab, //  tab → status
        childId
      }
    })
  },
  /**
   * [상세 조회 핵심 함수]
   *
   * 실제 API 모드:
   * GET /api/piggybanks/{id}
   */
  async getDetail(piggyId, childId) {
    return request({
      method: 'GET',
      url: `/piggybanks/${piggyId}`,
      params: childId != null ? { childId } : {} // 부모가 아이 저금통 볼 때만 childId
    })
  },
  // 추가: 저금통 생성
  /**
   * [생성 핵심 함수]
   * POST /api/piggybanks?walletId=  body { name, targetAmount }
   */
  async createPiggyBank(payload) {
    return request({
      method: 'POST',
      url: '/piggybanks',
      data: payload
    })
  },
  // 저금통 중도 포기(삭제)
  async closePiggyBank(piggyId) {
    return request({
      method: 'POST',
      url: `/piggybanks/${piggyId}/close`
    })
  },
  // 저금통 즐겨찾기 토글 (아이당 1개)
  async toggleFavorite(piggyId) {
    return request({
      method: 'PATCH',
      url: `/piggybanks/${piggyId}/favorite`
    })
  }
}

/* 해당 저금통에 보너스 설정 put */
export const setBonus = (piggyId, payload, childId) =>
  axiosInstance.put(`/piggybanks/${piggyId}/bonus`, payload, {
    params: childId != null ? { childId } : {}
  })

/* 저금통 응원 메시지 조회 */
export const getCheerMessages = (piggyId) =>
  axiosInstance.get(`/piggybanks/${piggyId}/cheer-messages`)

/* 저금통 응원 메시지 전송 */
export const sendCheerMessage = (piggyId, payload) =>
  axiosInstance.post(`/piggybanks/${piggyId}/cheer-messages`, payload)

/* 저금통 응원 메시지 삭제 */
export const deleteCheerMessage = (piggyId, messageId) =>
  axiosInstance.delete(`/piggybanks/${piggyId}/cheer-messages/${messageId}`)

/* 저금통 저축(입금) 내역 조회 */
export const getDeposits = (piggyId) => axiosInstance.get(`/piggybanks/${piggyId}/deposits`)

/* 저금통 상세 조회 (보너스 정보 포함) */
export const getPiggyBankDetail = (piggyId, childId) =>
  axiosInstance.get(`/piggybanks/${piggyId}`, {
    params: childId != null ? { childId } : {}
  })

/* 저금통 보너스 지급완료 */
export const payBonus = (piggyId, childId) =>
  axiosInstance.post(`/piggybanks/${piggyId}/bonus/pay`, null, {
    params: childId != null ? { childId } : {}
  })

/* 저금통 입금 실행 */
export const depositToPiggyBank = (piggyId, payload) =>
  axiosInstance.post(`/piggybanks/${piggyId}/deposits`, payload)

/* 저금통 생성 */
// export const createPiggyBank = (payload) => axiosInstance.post('/piggy-banks', payload)