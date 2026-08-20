import axiosInstance from './axiosInstance'

// 아직 그 달 리포트가 만들어지지 않았을 때 서버가 주는 코드 (404)
const REPORT_NOT_READY_CODE = 'RPT-001'

export function getReport(yearMonth, childId) {
  return axiosInstance.get(`/reports/${yearMonth}`, { params: { childId } })
}

export function getSpendingType(yearMonth, childId) {
  return axiosInstance.get(`reports/${yearMonth}/spending-type`, { params: { childId } })
}

/**
 * 리포트가 아직 없어서 실패한 요청인지 판별한다.
 *
 * 배치가 돌기 전이면 정상적으로 일어나는 일이라, 실패로 볼 게 아니라
 * "아직 없다"는 화면으로 안내해야 한다.
 */
export function isReportNotReady(error) {
  return error?.response?.data?.code === REPORT_NOT_READY_CODE
}
