<template>
  <NoChildConnected v-if="!hasChildren" />

  <div v-else-if="report" class="p-4 pb-8 flex flex-col gap-5">
    <CurrentChildBadge :name="selectedChildName" :avatar-image="spendingTypeImage" />

    <ReportBody
      :report="report"
      :spending-type="spendingType"
      :spending-type-image="spendingTypeImage"
      :subject-label="`${selectedChildName}의`"
      peer-label="아이"
      @prev-month="goToMonth(-1)"
      @next-month="goToMonth(1)"
    />

    <!-- 이하 기존 내용 동일 -->
  </div>

  <div v-else-if="isLoading" class="p-4 text-center text-sm py-10">불러오는 중...</div>

  <ReportNotReady v-else />
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ReportBody from '@/components/report/ReportBody.vue'
import ReportNotReady from '@/components/report/ReportNotReady.vue'
import CurrentChildBadge from '@/components/common/CurrentChildBadge.vue'
import { getReport, getSpendingType, isReportNotReady } from '@/api/report'
import { getSpendingTypeImage, DEFAULT_SPENDING_TYPE_IMAGE } from '@/constants/spendingTypeImages'
import { useAuthStore } from '@/stores/auth'
import NoChildConnected from '@/components/common/NoChildConnected.vue'
const props = defineProps({
  // 연결된 아이가 없는 부모는 childId 없이 이 화면에 들어온다.
  childId: {
    type: [String, Number],
    default: ''
  }
})

const authStore = useAuthStore()
const hasChildren = computed(() => (authStore.user?.child ?? []).length > 0)
const children = computed(() => authStore.user?.child ?? [])
const selectedChildName = computed(
  () => children.value.find((child) => String(child.id) === String(props.childId))?.name ?? '아이'
)

function getLastMonth() {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const currentYearMonth = ref(getLastMonth())
const report = ref(null)
const spendingType = ref(null)
const isLoading = ref(true)

const spendingTypeImage = computed(() =>
  spendingType.value ? getSpendingTypeImage(spendingType.value.code) : DEFAULT_SPENDING_TYPE_IMAGE
)

async function fetchReport() {
  if (!hasChildren.value) return

  isLoading.value = true

  try {
    const { data } = await getReport(currentYearMonth.value, props.childId)
    report.value = data.data
  } catch (error) {
    // 아직 만들어지지 않은 달이면 실패가 아니라 빈 화면으로 안내한다.
    report.value = null

    if (!isReportNotReady(error)) {
      console.error('리포트 조회 실패:', error)
    }
  } finally {
    isLoading.value = false
  }
}

async function fetchSpendingType() {
  if (!hasChildren.value) return

  try {
    const { data } = await getSpendingType(currentYearMonth.value, props.childId)
    spendingType.value = data.data
  } catch (error) {
    // 소비 유형도 리포트가 있어야 나온다. 리포트 쪽에서 이미 안내하므로 조용히 비운다.
    spendingType.value = null

    if (!isReportNotReady(error)) {
      console.error('소비 유형 조회 실패:', error)
    }
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

watch(
  () => props.childId,
  () => {
    fetchReport()
    fetchSpendingType()
  }
)

onMounted(() => {
  fetchReport()
  fetchSpendingType()
})
</script>
