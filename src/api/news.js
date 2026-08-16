import axiosInstance from './axiosInstance'

export function getNewsList(params) {
  return axiosInstance.get('/news', { params })
}
export function getNewsDetail(newsId, childId) {
  return axiosInstance.get(`/news/${newsId}`, { params: childId ? { childId } : undefined })
}
export function saveNewsAnswer(newsId, review, childId) {
  return axiosInstance.put(`/news/${newsId}/answers`, {
    childAnswer: review,
    ...(childId ? { childId } : {})
  })
}
