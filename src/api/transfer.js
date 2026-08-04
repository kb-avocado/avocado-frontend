import api from './axiosInstance'

// 호출 예시
// getTransferRecipient('USER_CODE', 'AVO1234')
// getTransferRecipient('ACCOUNT_NUMBER', '1234567890')

export function getTransferRecipient(searchType, keyword) {
  return api.get('/transfers/recipients', {
    params: {
      searchType,
      keyword
    }
  })
}
