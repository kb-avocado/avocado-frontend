import axiosInstance from './axiosInstance'

export function getNewsList(params) {
  return axiosInstance.get('/news', { params })
}
export function getNewsDetail(newsId) {
  return axiosInstance.get(`/news/${newsId}`)
}
export function saveNewsAnswer(newsId, review) {
  return axiosInstance.put(`/news/${newsId}/answers`, { childAnswer: review })
}