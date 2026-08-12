import api from './axiosInstance'

// 로그인한 본인 정보를 조회한다. userId를 보내지 않고 서버가 토큰에서 꺼내 쓴다.
export const getMyPage = () => api.get('/users/me')
