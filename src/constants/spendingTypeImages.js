import ch3 from '@/assets/images/cadoseed.png'
import ch27 from '@/assets/images/ch27.png'
import ch31 from '@/assets/images/ch31.png'
import ch28 from '@/assets/images/ch28.png'
import ch30 from '@/assets/images/ch30.png'
import ch26 from '@/assets/images/ch26.png'
import ch36 from '@/assets/images/ch36.png'
import ch33 from '@/assets/images/ch33.png'
import ch35 from '@/assets/images/ch35.png'

// ReportView.vue의 소비 유형 이미지와 동일한 매핑.
// 소비 유형이 아직 없거나(집계 전) 알 수 없는 코드면 SPROUT(씨앗형)을 기본값으로 쓴다.
export const SPENDING_TYPE_IMAGES = {
  SAVING_DREAMER: ch27, // 꿈꾸는 꿈돌이
  ZERO_SPENDING: ch31, // 겨울잠 소비
  ONE_STORE_SNIPER: ch28, // 하나만 노리는 저격수
  BIG_SPENDER: ch30, // 큰 거 한방
  ROLLER_COASTER: ch26, // 롤러코스터 소비
  CAREFUL_OWL: ch36, // 생각하고 쓰는 부엉이
  SMALL_SAVER: ch33, // 티끌모아 부자
  FREQUENT_SPARROW: ch35, // 방앗간 못 지나가는 참새
  SPROUT: ch3 // 씨앗형
}

export const DEFAULT_SPENDING_TYPE_IMAGE = ch3

export function getSpendingTypeImage(code) {
  return SPENDING_TYPE_IMAGES[code] ?? DEFAULT_SPENDING_TYPE_IMAGE
}
