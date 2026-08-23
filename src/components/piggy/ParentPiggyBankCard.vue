<template>
  <article
    class="relative p-[16px] grid gap-[13px] rounded-2xl shadow-[0_7px_19px_rgba(37,54,42,0.08)] cursor-pointer"
    style="background-color: #f5faff"
    @click="goToDetail"
  >
    <header
      class="min-w-0 grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-[11px]"
      :class="{ 'opacity-[0.45]': isFinished }"
    >
      <span
        class="w-[46px] h-[46px] grid place-items-center rounded-2xl text-[21px]"
        style="background-color: #f3f3f3"
        aria-hidden="true"
      >
        {{ icon }}
      </span>

      <!-- 목표명 + 대기 이유 -->
      <div class="min-w-0">
        <div class="flex items-center gap-3 min-w-0">
          <h2
            class="min-w-0 overflow-hidden text-base font-bold text-ellipsis whitespace-nowrap"
            style="color: #1d1b16"
          >
            {{ item.name }}
          </h2>

          <!-- 100% 달성 + 아직 대기 중 -->
          <button
            v-if="showSevenDayQuestion"
            type="button"
            class="shrink-0 text-xs underline underline-offset-2 whitespace-nowrap"
            style="color: #9aa090"
            @click.stop="showSevenDayInfo = true"
          >
            Q. 왜 {{ dday }}일을 더 기다려야 할까요?
          </button>
        </div>
      </div>

      <!-- ACTIVE 상태에서만 응원보내기 -->
      <button
        v-if="isActive"
        type="button"
        class="py-[7px] px-[12px] border-0 rounded-full text-xs font-bold whitespace-nowrap"
        style="background-color: #fcf7c2; color: #555353"
        @click.stop="goToCheerMessages"
      >
        응원보내기
      </button>
    </header>

    <!-- 진행률 -->
    <div
      class="grid gap-[9px]"
      :class="{ 'opacity-[0.45]': isFinished }"
    >
      <div class="flex items-center justify-between">
        <small
          class="text-sm"
          style="color: #72796b"
        >
          진행률
        </small>

        <strong
          class="text-xl"
          style="color: #000000"
        >
          {{ safeRate }}%
        </strong>
      </div>

      <div
        class="w-full h-2.5 overflow-hidden rounded-full"
        style="background-color: #ebebeb"
      >
        <div
          class="h-full rounded-full transition-[width] duration-700 ease-out"
          :style="{
            width: revealed ? `${safeRate}%` : '0%',
            backgroundColor: progressColor
          }"
        ></div>
      </div>
    </div>

    <!-- 진행 중 -->
    <section
      v-if="isActive"
      class="relative z-[3] min-h-[62px] py-3 px-[14px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-white"
      :class="{ 'opacity-[0.45]': isFinished }"
    >
      <div class="grid gap-[5px]">
        <small
          class="text-[11px]"
          style="color: #939393"
        >
          남은 금액
        </small>

        <strong
          class="text-[13px]"
          style="color: #000000"
        >
          {{ won(remainingAmount) }}
        </strong>
      </div>

      <div class="grid gap-[5px] text-right">
        <small
          class="text-[11px]"
          style="color: #939393"
        >
          목표
        </small>

        <strong
          class="text-[13px]"
          style="color: #000000"
        >
          {{ won(item.targetAmount) }}
        </strong>
      </div>
    </section>

    <!-- 100% 달성 후 대기 중 -->
    <section
      v-else-if="isPendingAchieve"
      class="relative z-[3] min-h-[62px] py-3 px-[14px] flex items-center gap-2 rounded-2xl bg-white"
      @click.stop
    >
      <img
        :src="cadoseedImage"
        alt=""
        aria-hidden="true"
        class="w-8 h-8 object-contain shrink-0"
      />

      <p
        class="text-[12px] leading-relaxed"
        style="color: #555353"
      >
        <strong style="color: #e1585a">
          {{ dday }}일
        </strong>
        을 기다리면 아이의 지갑으로 돈이 환급돼요.

        <br />

        <template v-if="hasBonus">
          보너스
          <strong style="color: #4e9440">
            {{ bonusAmountText }}
          </strong>
          은
          <strong style="color: #e1585a">
            {{ dday }}일
          </strong>
          뒤에 송금할 수 있어요.
        </template>
      </p>
    </section>

    <!-- 완료 / 보너스 대기 -->
    <section
      v-else
      class="relative z-[3] min-h-[62px] py-3 px-[14px] grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-white"
      :class="{ 'opacity-[0.45]': isFinished }"
      @click.stop
    >
      <div class="grid gap-[5px]">
        <small
          class="text-[11px] font-bold"
          style="color: #939393"
        >
          보호자 추가 보너스
        </small>

        <strong
          class="text-[13px]"
          :style="{
            color: !hasBonus
              ? '#939393'
              : isBonusPaid
                ? '#4e9440'
                : '#e1585a'
          }"
        >
          {{
            !hasBonus
              ? '없음'
              : isBonusPaid
                ? '지급 완료'
                : '미지급'
          }}
        </strong>
      </div>

      <button
        type="button"
        class="min-w-[91px] h-[38px] border-0 rounded-2xl bg-avocado-600 text-white text-[11px] font-bold disabled:bg-[#dcead5] disabled:shadow-none"
        :disabled="!isCompleted || !hasBonus || isBonusPaid"
        @click.stop="goToBonusTransfer"
      >
        보너스 송금
      </button>
    </section>

    <!-- 7일 규칙 안내 모달 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showSevenDayInfo"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          @click.self="showSevenDayInfo = false"
        >
          <div
            class="relative w-full max-w-[320px] rounded-3xl bg-white p-6 shadow-xl"
            @click.stop
          >
            <!-- 닫기 -->
            <button
              type="button"
              class="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"
              aria-label="닫기"
              @click="showSevenDayInfo = false"
            >
              <X :size="19" />
            </button>

            <!-- 아보카도씨 -->
            <img
              :src="cadoseedImage"
              alt=""
              aria-hidden="true"
              class="w-20 h-20 mx-auto object-contain"
            />

            <!-- 제목 -->
            <h3
              class="mt-3 text-xl font-bold text-center text-gray-900"
            >
              왜
              <span style="color: #f47a3c">
                7일
              </span>
              을 기다려야 할까요?
            </h3>

            <!-- 부모용 설명 -->
            <div
              class="mt-6 rounded-2xl bg-gray-50 p-5 text-sm leading-[1.8] text-gray-600"
            >
              <p>
                아이가 저금통을 빠르게 채워도<br>
                <strong class="font-bold text-gray-800">
                  첫 입금일부터 최소 7일이 지나야<br>
                </strong>
                보너스를 받고 저금통을 완료할 수 있어요.
              </p>

              <p class="mt-4">
                저금통을 만들자마자 목표 금액을 채워<br>
                보너스만 받는 일이 반복되지 않도록 하고,
                아이가
                <strong class="font-bold text-gray-800">
                  돈을 모으고 기다리는 경험
                </strong>
                을<br> 할 수 있도록 만든 아보카도의 규칙이에요.
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </article>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref
} from 'vue'

import { useRouter } from 'vue-router'
import { X } from 'lucide-vue-next'

import cadoseedImage from '@/assets/images/cadoseed.png'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },

  childId: {
    type: [String, Number],
    required: true
  },

  index: {
    type: Number,
    default: 0
  }
})

const router = useRouter()

// 진행률 애니메이션
const revealed = ref(false)

// 7일 규칙 안내 모달
const showSevenDayInfo = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    revealed.value = true
  })
})

// 서버 상태
const normalizedStatus = computed(() =>
  String(
    props.item.status ?? ''
  ).toUpperCase()
)

// 100% 달성 후 7일 대기 중
const isPendingAchieve = computed(
  () =>
    normalizedStatus.value ===
    'PENDING_ACHIEVE'
)

// 완전히 진행 중
const isActive = computed(
  () =>
    normalizedStatus.value ===
    'ACTIVE'
)

// 완료 상태
const isCompleted = computed(() =>
  [
    'ACHIEVE',
    'ACHIEVED',
    'COMPLETED'
  ].includes(
    normalizedStatus.value
  )
)

// 첫 입금일부터 7일까지 남은 날짜
const dday = computed(() => {
  if (
    normalizedStatus.value !==
      'PENDING_ACHIEVE' ||
    !props.item.firstDepositedAt
  ) {
    return null
  }

  const start = new Date(
    props.item.firstDepositedAt
  )

  const complete = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 7
  )

  const now = new Date()

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )

  return Math.max(
    0,
    Math.round(
      (complete - today) /
        86400000
    )
  )
})

// Q 표시 조건
const showSevenDayQuestion = computed(
  () =>
    isPendingAchieve.value &&
    dday.value != null &&
    dday.value > 0
)

// 보너스 송금
function goToBonusTransfer() {
  router.push({
    name: 'piggyGoalComplete',
    params: {
      childId: props.childId,
      id: props.item.piggyBankId
    }
  })
}

// 응원 메시지
function goToCheerMessages() {
  router.push({
    name: 'piggyCheerCompose',
    params: {
      childId: props.childId,
      id: props.item.piggyBankId
    }
  })
}

// 저금통 상세
function goToDetail() {
  router.push({
    name: 'piggyDetail',
    params: {
      childId: props.childId,
      id: props.item.piggyBankId
    }
  })
}

// 보너스 상태
const bonusStatus = computed(() =>
  String(
    props.item.bonus?.status ?? ''
  ).toUpperCase()
)

// 보너스 지급 완료
const isBonusPaid = computed(() =>
  [
    'PAID',
    'COMPLETED'
  ].includes(
    bonusStatus.value
  )
)

// 보너스 설정 여부
const hasBonus = computed(
  () =>
    String(
      props.item.bonus?.type ?? 'NONE'
    ).toUpperCase() !== 'NONE'
)

// 비율형 보너스 계산
function calculateRateBonus(bonus) {
  if (
    String(
      bonus?.type
    ).toUpperCase() !== 'RATE' ||
    bonus?.rate == null
  ) {
    return 0
  }

  return Math.floor(
    (
      Number(
        props.item.targetAmount || 0
      ) *
      Number(bonus.rate)
    ) / 100
  )
}

// 보너스 금액
const bonusAmountText = computed(() => {
  const bonus = props.item.bonus

  if (!bonus) {
    return ''
  }

  return won(
    bonus.amount ??
      calculateRateBonus(bonus)
  )
})

// 최종 완료
const isFinished = computed(
  () =>
    isCompleted.value &&
    (
      !hasBonus.value ||
      isBonusPaid.value
    )
)

// 남은 금액
const remainingAmount = computed(() =>
  Math.max(
    0,
    Number(
      props.item.targetAmount || 0
    ) -
      Number(
        props.item.savedAmount || 0
      )
  )
)

// 아이콘
const icon = computed(() => {
  if (props.item.icon) {
    return props.item.icon
  }

  const text =
    `${props.item.name ?? ''} ${props.item.description ?? ''}`

  if (text.includes('자전거')) {
    return '🚲'
  }

  if (text.includes('책')) {
    return '📚'
  }

  if (text.includes('게임')) {
    return '🎮'
  }

  if (text.includes('여행')) {
    return '🌍'
  }

  if (text.includes('선물')) {
    return '🎁'
  }

  return '🚀'
})

// 금액
function won(amount) {
  return `${Number(
    amount || 0
  ).toLocaleString('ko-KR')}원`
}

// 진행률
const safeRate = computed(() => {
  if (isCompleted.value) {
    return 100
  }

  const value = Number(
    props.item.progressRate || 0
  )

  return Math.min(
    100,
    Math.max(
      0,
      value
    )
  )
})

// 카드별 진행률 색상
const PROGRESS_COLORS = [
  '#FF8C69',
  '#7BC8F5',
  '#B39DDB'
]

const progressColor = computed(
  () =>
    PROGRESS_COLORS[
      props.index %
        PROGRESS_COLORS.length
    ]
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>