import ch3 from '@/assets/images/ch3.png'
import ch13 from '@/assets/images/ch13.png'
import ch14 from '@/assets/images/ch14.png'
import ch15 from '@/assets/images/ch15.png'
import ch16 from '@/assets/images/ch16.png'
import ch18 from '@/assets/images/ch18.png'
import ch19 from '@/assets/images/ch19.png'
import ch21 from '@/assets/images/ch21.png'
import ch23 from '@/assets/images/ch23.png'

// ReportView.vue의 소비 유형 이미지와 동일한 매핑.
// 소비 유형이 아직 없거나(집계 전) 알 수 없는 코드면 SPROUT(씨앗형)을 기본값으로 쓴다.
export const SPENDING_TYPE_IMAGES = {
  SAVING_DREAMER: ch13, // 꿈꾸는 꿈돌이
  ZERO_SPENDING: ch14, // 겨울잠 소비
  ONE_STORE_SNIPER: ch15, // 하나만 노리는 저격수
  BIG_SPENDER: ch16, // 큰 거 한방
  ROLLER_COASTER: ch18, // 롤러코스터 소비
  CAREFUL_OWL: ch19, // 생각하고 쓰는 부엉이
  SMALL_SAVER: ch21, // 티끌모아 부자
  FREQUENT_SPARROW: ch23, // 방앗간 못 지나가는 참새
  SPROUT: ch3 // 씨앗형
}

export const DEFAULT_SPENDING_TYPE_IMAGE = ch3

export function getSpendingTypeImage(code) {
  return SPENDING_TYPE_IMAGES[code] ?? DEFAULT_SPENDING_TYPE_IMAGE
}
