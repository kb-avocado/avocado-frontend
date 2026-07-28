<template>
  <div class="parent-list-page">
    <PiggyBankTabs v-model="tab" />

    <section class="parent-list-page__intro">
      <h1>{{ introTitle }}</h1>
      <p>{{ introDescription }}</p>
    </section>

    <section v-if="error" class="parent-list-page__error">
      <p>{{ error }}</p>

      <button type="button" @click="load">다시 시도</button>
    </section>

    <div v-else-if="loading" class="parent-list-page__state">저금통 목록을 불러오는 중입니다.</div>

    <section v-else-if="items.length > 0" class="parent-list-page__cards">
      <ParentPiggyBankCard v-for="item in items" :key="item.piggyBankId" :item="item" />
    </section>

    <div v-else class="parent-list-page__state">
      {{ tab === 'IN_PROGRESS' ? '진행 중인 저금통이 없습니다.' : '완료된 저금통이 없습니다.' }}
    </div>

    <template v-if="tab === 'IN_PROGRESS'">
      <button type="button" class="parent-list-page__add" disabled>
        <span aria-hidden="true">＋</span>
        새로운 저금 목표 추가하기
      </button>

      <p class="parent-list-page__count">
        저금 목표는 최대
        {{ parentMaxCount }}개까지 만들 수 있어요.

        <strong>
          (현재
          {{ parentActiveCount }}/{{ parentMaxCount }})
        </strong>
      </p>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import { usePiggyBankStore } from '@/stores/piggyBank'
import PiggyBankTabs from '@/components/common/PiggyBankTabs.vue'
import ParentPiggyBankCard from '@/components/common/ParentPiggyBankCard.vue'

const props = defineProps({
  childId: {
    type: [String, Number],
    required: true
  }
})

const store = usePiggyBankStore()

const tab = ref('IN_PROGRESS')
const loading = ref(false)
const error = ref('')

/**
 * 현재 childId에 해당하는 보호자 목록 상태를 가져옵니다.
 */
const parentState = computed(() => store.getParentState(props.childId))

/**
 * 현재 선택한 탭의 보호자 목록을 반환합니다.
 */
const items = computed(() => store.getParentList(props.childId, tab.value))

const parentActiveCount = computed(() => Number(parentState.value?.activeCount ?? 0))

const parentMaxCount = computed(() => Number(parentState.value?.maxCount ?? 3))

const introTitle = computed(() => (tab.value === 'CLOSED' ? '모으기 성공! 🎉' : '아이의 저금 목표'))

const introDescription = computed(() =>
  tab.value === 'CLOSED'
    ? '정말 멋져요, 목표를 다 달성했어요.'
    : '아이의 목표 달성을 응원하는 특별한 선물을 준비해 보세요!'
)

/**
 * [보호자 목록 조회 핵심 함수]
 *
 * childId와 현재 탭을 전달하여
 * 아이의 저금통 목록을 서버에서 조회합니다.
 */
async function load() {
  loading.value = true
  error.value = ''

  try {
    await store.loadParentList(props.childId, tab.value)
  } catch (requestError) {
    error.value = requestError.message || '아이의 저금통 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

/**
 * childId 또는 탭이 변경되면 목록을 다시 조회합니다.
 *
 * immediate: true이므로 최초 진입 시에도
 * load()가 실행됩니다.
 */
watch(() => [props.childId, tab.value], load, {
  immediate: true
})
</script>

<style scoped>
.parent-list-page {
  width: 100%;
  min-height: 100%;
  padding: 22px 20px 36px;
  background: #fff;
}

.parent-list-page__intro {
  margin: 26px 0 20px;
}

.parent-list-page__intro h1 {
  margin: 0 0 7px;
  color: #252a26;
  font-size: 22px;
  letter-spacing: -0.7px;
}

.parent-list-page__intro p {
  margin: 0;
  color: #4b534e;
  font-size: 13px;
  line-height: 1.55;
}

.parent-list-page__cards {
  display: grid;
  gap: 18px;
}

.parent-list-page__state {
  min-height: 240px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: #fafcfa;
  color: #929a94;
  font-size: 12px;
  text-align: center;
}

.parent-list-page__error {
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 13px;
  background: #fff1ee;
  color: #a73e33;
}

.parent-list-page__error p {
  margin: 0;
  font-size: 12px;
}

.parent-list-page__error button {
  padding: 8px 10px;
  border: 0;
  border-radius: 8px;
  background: #a73e33;
  color: #fff;
  font-size: 11px;
}

.parent-list-page__add {
  width: 100%;
  min-height: 76px;
  margin-top: 20px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 3px;
  border: 1.5px dashed #dce5dc;
  border-radius: 18px;
  background: #fff;
  color: #9ba49d;
  font-size: 11px;
}

.parent-list-page__add span {
  font-size: 21px;
}

.parent-list-page__count {
  margin: 25px 0 0;
  color: #777f79;
  font-size: 9px;
  text-align: center;
}

.parent-list-page__count strong {
  color: #3d7837;
}
</style>
