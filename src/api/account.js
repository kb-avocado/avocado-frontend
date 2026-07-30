import api from './axiosInstance'

export const createAccount = (data) => api.post('/accounts', data)
export const getAccounts = () => api.get('/accounts')