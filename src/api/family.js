import api from './axiosInstance'

export const requestFamilyConnect = (data) => api.post('/family/requests', data)
export const getFamilyRequest = (requestId) => api.get(`/family/requests/${requestId}`)
export const getMyCode = () => api.get('/users/me/code')
export const updateFamilyRequest = (requestId, data) =>
    api.patch(`/family/requests/${requestId}`, data)
export const cancelFamilyRequest = (requestId) => api.patch(`/family/requests/${requestId}/cancel`)