import { defineStore } from 'pinia'
import { ref } from 'vue'

// EventSource는 화면에 그릴 값이 아니라 연결 그 자체라 리액티브 상태로 두지 않는다.
let source = null

// 연결이 언제 열리고 닫히는지는 화면에 드러나지 않아 개발 중에는 로그로 확인한다.
function log(message, ...rest) {
  if (!import.meta.env.DEV) return

  console.log(`[알림] ${message}`, ...rest)
}

/**
 * 실시간 알림(SSE) 연결을 관리한다.
 */
export const useNotificationStore = defineStore('notification', () => {
  // 연결 여부. 화면에서 실시간 표시를 켤지 판단할 때 쓴다.
  const connected = ref(false)

  // 연결된 동안 받은 알림. 최신이 앞이다.
  // 끊겨 있는 동안 쌓인 알림은 여기 없으므로 목록은 조회 API로 채워야 한다.
  const received = ref([])

  /**
   * 로그인 상태에 맞춰 알림 스트림을 열거나 닫는다.
   *
   * 라우터 가드가 화면을 옮길 때마다 부르기 때문에 이미 열려 있으면 아무 일도 하지 않는다.
   * 덕분에 로그인 직후, 회원가입 직후, 새로고침 복구를 한곳에서 함께 처리할 수 있다.
   *
   * @param user 현재 로그인한 회원. 없으면 연결을 닫는다.
   */
  function sync(user) {
    if (user?.status === 'ACTIVE') {
      connect()
      return
    }

    disconnect()
  }

  function connect() {
    if (source) return

    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

    // EventSource는 헤더를 붙일 수 없어 쿠키로만 인증한다.
    // 배포처럼 출처가 다를 때도 쿠키를 실으려면 withCredentials가 필요하다.
    source = new EventSource(`${baseUrl}/notifications/subscribe`, {
      withCredentials: true
    })

    log('구독 요청')

    // 서버가 연결 직후 한 번 보내는 확인용 이벤트다. 담긴 값은 쓰지 않는다.
    source.addEventListener('connect', () => {
      connected.value = true
      log('구독 시작')
    })

    // 이벤트 이름이 붙어 있어 onmessage로는 잡히지 않는다.
    source.addEventListener('notification', (event) => {
      const notification = JSON.parse(event.data)

      received.value.unshift(notification)
      log('알림 수신', notification)
    })

    source.onerror = () => {
      connected.value = false

      // CLOSED면 브라우저가 재연결을 포기한 것이고, CONNECTING이면 다시 붙는 중이다.
      log(
        source?.readyState === EventSource.CLOSED
          ? '연결 끊김 (재연결 포기, 인증 만료 가능성)'
          : '연결 끊김 (재연결 시도 중)'
      )

      if (source?.readyState === EventSource.CLOSED) {
        disconnect()
      }

      // CONNECTING이면 브라우저가 알아서 다시 붙는 중이라 그대로 둔다.
    }
  }

  /**
   * 알림 스트림을 닫는다.
   * 로그아웃은 쿠키만 만료시킬 뿐, 이미 열린 스트림은 서버가 끊지 않는다.
   */
  function disconnect() {
    if (!source) return

    source.close()
    source = null
    connected.value = false
    received.value = []

    log('구독 해제')
  }

  return { connected, received, sync, disconnect }
})
