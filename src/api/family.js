import api from './axiosInstance'

export const requestFamilyConnect = (data) => api.post('/family/requests', data)
export const getFamilyRequest = (requestId) => api.get(`/family/requests/${requestId}`)
export const getFamilyRequestCheck = (requestId) => api.get(`/family/requests/${requestId}/check`)
export const updateFamilyRequest = (requestId, data) =>
    api.patch(`/family/requests/${requestId}`, data)
export const confirmFamilyRequest = (requestId, confirm) =>
    api.patch(`/family/requests/${requestId}/confirm`, { confirm })