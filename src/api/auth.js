import axiosInstance from './axiosInstance'

export const login = (payload) => axiosInstance.post('/auth/login', payload)
export const logout = () => axiosInstance.post('/auth/logout')
export const signup = (payload) => axiosInstance.post('/auth/signup', payload)
