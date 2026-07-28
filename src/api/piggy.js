import axiosInstance from './axiosInstance'

/* 해당 저금통에 보너스 설정 put */
export const setBonus = (piggyId, payload) =>
  axiosInstance.put(`/piggybanks/${piggyId}/bonus`, payload)

/* 저금통 응원 메시지 조회 */
export const getCheerMessages = (piggyId) =>
  axiosInstance.get(`/piggybanks/${piggyId}/cheer-messages`)

/* 저금통 응원 메시지 전송 */
export const sendCheerMessage = (piggyId, payload) =>
  axiosInstance.post(`/piggybanks/${piggyId}/cheer-messages`, payload)

/* 저금통 응원 메시지 삭제 */
export const deleteCheerMessage = (piggyId, messageId) =>
  axiosInstance.delete(`/piggybanks/${piggyId}/cheer-messages/${messageId}`)