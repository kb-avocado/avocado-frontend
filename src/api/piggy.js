import axiosInstance from './axiosInstance'

/* 해당 저금통에 보너스 설정 put */
export const setBonus = (piggyId, payload) =>
  axiosInstance.put(`/piggybanks/${piggyId}/bonus`, payload)