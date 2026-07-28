import axiosInstance from '@/api/axiosInstance'

import { getChildMockList, getParentMockList } from '@/mocks/piggyBankMockData'

/**
 * 개발 환경이며 환경변수가 true일 때만
 * 테스트 데이터를 사용합니다.
 */
const useMockData = import.meta.env.DEV && import.meta.env.VITE_USE_PIGGY_BANK_MOCK === 'true'

/**
 * Mock 데이터도 실제 네트워크 요청처럼
 * 잠깐 기다렸다가 응답하게 합니다.
 *
 * 이를 통해 로딩 화면도 확인할 수 있습니다.
 */
function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })
}

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

/**
 * 보호자 목록에 필요한 아이 번호를 검사합니다.
 */
function validateChildId(childId) {
  const normalizedChildId = String(childId ?? '').trim()

  if (!normalizedChildId) {
    throw new Error('아이 번호를 확인해 주세요.')
  }

  return normalizedChildId
}

export const piggyBankApi = {
  /**
   * [아이 목록 조회 핵심 함수]
   *
   * Mock 모드:
   * piggyBankMockData.js 데이터를 반환합니다.
   *
   * 실제 API 모드:
   * GET /api/piggy-banks
   */
  async getChildList(tab = 'IN_PROGRESS') {
    if (useMockData) {
      await wait(400)

      return getChildMockList(tab)
    }

    return request({
      method: 'GET',
      url: '/piggy-banks',
      params: {
        tab
      }
    })
  },

  /**
   * [보호자 목록 조회 핵심 함수]
   *
   * Mock 모드:
   * piggyBankMockData.js 데이터를 반환합니다.
   *
   * 실제 API 모드:
   * GET
   * /api/parent/children/{childId}/piggy-banks
   */
  async getParentList(childId, tab = 'IN_PROGRESS') {
    const normalizedChildId = validateChildId(childId)

    if (useMockData) {
      await wait(400)

      return getParentMockList(normalizedChildId, tab)
    }

    return request({
      method: 'GET',
      url: `/parent/children/` + `${encodeURIComponent(normalizedChildId)}` + `/piggy-banks`,
      params: {
        tab
      }
    })
  }
}
