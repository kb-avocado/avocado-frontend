<template>
  <div v-if="report" class="p-4 pb-8 flex flex-col gap-5">
    <ReportBody
      :report="report"
      :spending-type="spendingType"
      :spending-type-image="spendingTypeImage"
      subject-label="나의"
      peer-label="친구"
      @prev-month="goToMonth(-1)"
      @next-month="goToMonth(1)"
    />

    <!-- 아보카도 씨의 한마디 -->
    <!-- TODO(backend): AI 조언 API 아직 없음. 생기면 report.advice로 연결 -->
    <div
      v-if="report.advice"
      class="rounded-3xl shadow-[0px_8px_24px_0px_rgba(54,106,27,0.06)] p-5 flex items-center gap-4"
      style="background-color: #f8dcae"
    >
      <img
        src="@/assets/images/ch3.png"
        alt="아보카도 캐릭터"
        class="w-32 h-40 object-contain shrink-0"
      />

      <div>
        <p class="text-sm font-bold text-avocado-600 mb-5">아보카도 씨의 한마디</p>

        <p class="text-sm text-gray-800 leading-relaxed">
          {{ report.advice }}
        </p>
      </div>
    </div>
  </div>

  <div v-else class="p-4 text-center text-sm py-10">불러오는 중...</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ReportBody from '@/components/report/ReportBody.vue'
import { getReport, getSpendingType } from '@/api/report'
import { getSpendingTypeImage, DEFAULT_SPENDING_TYPE_IMAGE } from '@/constants/spendingTypeImages'

function getLastMonth() {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const currentYearMonth = ref(getLastMonth())
const report = ref(null)
const spendingType = ref(null)

const spendingTypeImage = computed(() =>
  spendingType.value ? getSpendingTypeImage(spendingType.value.code) : DEFAULT_SPENDING_TYPE_IMAGE
)

async function fetchReport() {
  try {
    const { data } = await getReport(currentYearMonth.value)
    report.value = data.data
  } catch (error) {
    console.error('리포트 조회 실패:', error)
  }
}

async function fetchSpendingType() {
  try {
    const { data } = await getSpendingType(currentYearMonth.value)
    spendingType.value = data.data
  } catch (error) {
    console.error('소비 유형 조회 실패:', error)
  }
}

function goToMonth(diff) {
  const [year, month] = currentYearMonth.value.split('-').map(Number)

  const date = new Date(year, month - 1 + diff, 1)

  currentYearMonth.value =
    `${date.getFullYear()}-` + `${String(date.getMonth() + 1).padStart(2, '0')}`

  fetchReport()
  fetchSpendingType()
}

onMounted(() => {
  fetchReport()
  fetchSpendingType()
})
</script>
