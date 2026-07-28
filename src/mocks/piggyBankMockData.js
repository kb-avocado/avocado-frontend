const inProgressPiggyBanks = [
  {
    piggyBankId: 1,
    name: '레고 우주선',
    description: '장난감',
    status: 'ACTIVE',
    favorite: true,
    savedAmount: 135000,
    targetAmount: 180000,
    progressRate: 75,
    goalReached: false,
    completable: false,
    completableAt: null,
    targetAchievedAt: null,
    bonus: {
      bonusId: 1,
      type: 'FIXED',
      rate: null,
      amount: 10000,
      status: 'ACTIVE',
      paidAmount: null,
      paidAt: null
    }
  },

  {
    piggyBankId: 2,
    name: '산악 자전거',
    description: '스포츠',
    status: 'ACTIVE',
    favorite: false,
    savedAmount: 54000,
    targetAmount: 180000,
    progressRate: 30,
    goalReached: false,
    completable: false,
    completableAt: null,
    targetAchievedAt: null,
    bonus: null
  },

  {
    piggyBankId: 3,
    name: '닌텐도 게임기',
    description: '게임',
    status: 'ACTIVE',
    favorite: true,
    savedAmount: 90000,
    targetAmount: 120000,
    progressRate: 75,
    goalReached: false,
    completable: false,
    completableAt: null,
    targetAchievedAt: null,
    bonus: {
      bonusId: 2,
      type: 'FIXED',
      rate: null,
      amount: 10000,
      status: 'ACTIVE',
      paidAmount: null,
      paidAt: null
    }
  }
]

const closedPiggyBanks = [
  /**
   * 정상 완료 + 보너스 미지급
   */
  {
    piggyBankId: 4,
    name: '여행 가방',
    description: '여행',
    status: 'ACHIEVED',
    favorite: false,
    savedAmount: 200000,
    targetAmount: 200000,
    progressRate: 100,
    goalReached: true,
    completable: false,
    completableAt: null,
    targetAchievedAt: '2026-07-20T10:30:00',
    bonus: {
      bonusId: 3,
      type: 'FIXED',
      rate: null,
      amount: 20000,
      status: 'ACTIVE',
      paidAmount: null,
      paidAt: null
    }
  },

  /**
   * 정상 완료 + 보너스 지급 완료
   */
  {
    piggyBankId: 5,
    name: '레고 우주선',
    description: '장난감',
    status: 'ACHIEVED',
    favorite: false,
    savedAmount: 180000,
    targetAmount: 180000,
    progressRate: 100,
    goalReached: true,
    completable: false,
    completableAt: null,
    targetAchievedAt: '2026-07-21T14:20:00',
    bonus: {
      bonusId: 4,
      type: 'FIXED',
      rate: null,
      amount: 10000,
      status: 'PAID',
      paidAmount: 10000,
      paidAt: '2026-07-22T09:30:00'
    }
  },

  /**
   * 정상 완료 + 보너스 설정 없음
   */
  {
    piggyBankId: 6,
    name: '경제 도서 세트',
    description: '도서',
    status: 'ACHIEVED',
    favorite: false,
    savedAmount: 80000,
    targetAmount: 80000,
    progressRate: 100,
    goalReached: true,
    completable: false,
    completableAt: null,
    targetAchievedAt: '2026-07-23T11:00:00',
    bonus: null
  },

  /**
   * 중도 포기
   *
   * 완료 탭에는 표시하지만
   * 저금통 깨기 완료 문구는 표시하지 않습니다.
   */
  {
    piggyBankId: 7,
    name: '산악 자전거',
    description: '스포츠',
    status: 'CANCELLED',
    favorite: false,
    savedAmount: 54000,
    targetAmount: 180000,
    progressRate: 30,
    goalReached: false,
    completable: false,
    completableAt: null,
    targetAchievedAt: null,
    bonus: {
      bonusId: 5,
      type: 'FIXED',
      rate: null,
      amount: 10000,
      status: 'CANCELLED',
      paidAmount: null,
      paidAt: null
    }
  }
]

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

/**
 * [아이 테스트 목록 데이터 반환 함수]
 */
export function getChildMockList(tab = 'IN_PROGRESS') {
  const piggyBanks = tab === 'CLOSED' ? closedPiggyBanks : inProgressPiggyBanks

  return clone({
    activeCount: inProgressPiggyBanks.length,

    maxCount: 3,

    canCreate: inProgressPiggyBanks.length < 3,

    piggyBanks
  })
}

/**
 * [보호자 테스트 목록 데이터 반환 함수]
 *
 * 현재 화면 디자인 테스트 단계이므로 아이 화면과
 * 동일한 저금통 데이터를 반환합니다.
 */
export function getParentMockList(childId, tab = 'IN_PROGRESS') {
  const piggyBanks = tab === 'CLOSED' ? closedPiggyBanks : inProgressPiggyBanks

  return clone({
    childId: Number(childId),

    activeCount: inProgressPiggyBanks.length,

    maxCount: 3,

    canCreate: inProgressPiggyBanks.length < 3,

    piggyBanks
  })
}
