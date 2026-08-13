import axiosInstance from './axiosInstance'

export function getHome(childId) {
  return axiosInstance.get('/home', { params: childId ? { childId } : undefined })
}
