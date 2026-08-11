import axiosInstance from './axiosInstance'

export function getReport(yearMonth, childId) {
  return axiosInstance.get(`/reports/${yearMonth}`, { params: { childId } })
}

export function getSpendingType(yearMonth, childId) {
  return axiosInstance.get(`reports/${yearMonth}/spending-type`, { params: { childId } })
}
