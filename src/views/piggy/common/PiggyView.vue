<template>
  <div class="child-list-page">
    <PiggyBankTabs v-model="tab" />

    <section class="child-list-page__intro">
      <h1>{{ introTitle }}</h1>
      <p>{{ introDescription }}</p>
    </section>
    <!-- 즐겨찾기 북마크 추가 -->
    <button
      v-if="tab === 'IN_PROGRESS'"
      type="button"
      class="child-list-page__filter"
      :class="{ 'child-list-page__filter--active': showFavoritesOnly }"
      :aria-pressed="showFavoritesOnly"
      @click="showFavoritesOnly = !showFavoritesOnly"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 2h12a1 1 0 0 1 1 1v18l-7-4-7 4V3a1 1 0 0 1 1-1z"
          :fill="showFavoritesOnly ? '#78B159' : 'none'"
          stroke="#78B159"
          stroke-width="2"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <section v-if="error" class="child-list-page__error">
      <span aria-hidden="true">!</span>

      <p>{{ error }}</p>

      <button type="button" @click="load">다시 시도</button>
    </section>

    <div v-else-if="loading" class="child-list-page__state">저금통 목록을 불러오는 중입니다.</div>
    <!-- 카드에 이벤트 연결 -->
    <!-- 즐겨찾기 : item에서 displayedItems 변경 -->
    <section v-else-if="displayedItems.length > 0" class="child-list-page__cards">
      <ChildPiggyBankCard
        v-for="item in displayedItems"
        :key="item.piggyBankId"
        :item="item"
        @toggle-favorite="onToggleFavorite"
      />
    </section>

    <div v-else class="child-list-page__state">
      {{
        showFavoritesOnly
          ? '즐겨찾기한 저금통이 없습니다.'
          : tab === 'IN_PROGRESS'
            ? '진행 중인 저금통이 없습니다.'
            : '완료된 저금통이 없습니다.'
      }}
    </div>
    <!-- 저금통 생성 버튼 연결 -->
    <template v-if="tab === 'IN_PROGRESS'">
      <button
        type="button"
        class="child-list-page__add"
        :disabled="!store.childCanCreate"
        @click="goToCreate"
      >
        <span aria-hidden="true">＋</span>
        새로운 저금 목표 추가하기
      </button>

      <p class="child-list-page__count">
        저금 목표는 최대
        {{ store.childMaxCount }}개까지 만들 수 있어요.

        <strong>
          (현재
          {{ store.childActiveCount }}/{{ store.childMaxCount }})
        </strong>
      </p>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import { usePiggyBankStore } from '@/stores/piggyBank'
import PiggyBankTabs from '@/components/piggy/PiggyBankTabs.vue'
import ChildPiggyBankCard from '@/components/piggy/ChildPiggyBankCard.vue'

import { useRouter } from 'vue-router'

const store = usePiggyBankStore()

const router = useRouter()

const tab = ref('IN_PROGRESS')
const loading = ref(false)
const error = ref('')

// 즐겨찾기만 보기 토글
const showFavoritesOnly = ref(false)

// 화면에 실제로 뿌릴 목록 (필터 적용)
const displayedItems = computed(() =>
  showFavoritesOnly.value && tab.value === 'IN_PROGRESS'
    ? items.value.filter((i) => i.favorite)
    : items.value
)

// 저금통 생성 연결부분
function goToCreate() {
  router.push({ name: 'piggyCreate' })
}

// 카드에 이벤트 연결 핸들러 추가
function onToggleFavorite(item) {
  store.toggleFavorite(item.piggyBankId)
}

/**
 * 현재 선택한 탭의 목록을 Pinia store에서 가져옵니다.
 */
const items = computed(() => store.getChildList(tab.value))

const introTitle = computed(() => (tab.value === 'CLOSED' ? '모으기 성공! 🎉' : '나의 저금 목표'))

const introDescription = computed(() =>
  tab.value === 'CLOSED'
    ? '정말 멋져요, 목표를 다 달성했어요.'
    : '보호자님이 목표 달성을 응원하는 특별한 선물을 준비했어요!'
)

/**
 * [아이 목록 조회 핵심 함수]
 *
 * store.loadChildList()를 호출해서
 * 현재 탭의 목록을 서버에서 조회합니다.
 */
async function load() {
  loading.value = true
  error.value = ''

  try {
    await store.loadChildList(tab.value)
  } catch (requestError) {
    error.value = requestError.message || '저금통 목록을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}

/**
 * 진행중/완료 탭이 바뀌면 목록을 다시 조회합니다.
 *
 * immediate: true이므로 화면 최초 진입 때도
 * load()가 자동으로 실행됩니다.
 */
watch(tab, load, {
  immediate: true
})
</script>

<style scoped>
.child-list-page {
  width: 100%;
  min-height: 100%;
  padding: 22px 20px 36px;
  background: #fff;
}

.child-list-page__intro {
  margin: 26px 0 20px;
}

.child-list-page__intro h1 {
  margin: 0 0 7px;
  color: #252a26;
  font-size: 22px;
  letter-spacing: -0.7px;
}

.child-list-page__intro p {
  margin: 0;
  color: #4b534e;
  font-size: 13px;
  line-height: 1.55;
}

.child-list-page__cards {
  display: grid;
  gap: 18px;
}

.child-list-page__state {
  min-height: 240px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: #fafcfa;
  color: #929a94;
  font-size: 12px;
  text-align: center;
}

.child-list-page__error {
  min-height: 72px;
  padding: 14px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  border-radius: 13px;
  background: #fff1ee;
  color: #a73e33;
}

.child-list-page__error p {
  margin: 0;
  font-size: 12px;
}

.child-list-page__error button {
  padding: 8px 10px;
  border: 0;
  border-radius: 8px;
  background: #a73e33;
  color: #fff;
  font-size: 11px;
}

.child-list-page__add {
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

.child-list-page__add span {
  font-size: 21px;
}

.child-list-page__count {
  margin: 25px 0 0;
  color: #777f79;
  font-size: 9px;
  text-align: center;
}

.child-list-page__count strong {
  color: #3d7837;
}
/* 즐겨찾기 북마크 버튼 */
.child-list-page__filter {
  display: inline-flex;
  align-items: center;
  padding: 6px 8px;
  margin-bottom: 12px;
  border: 1px solid #edf0ed;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
}
.child-list-page__filter--active {
  background: #eef8e5;
  border-color: #cfe6bd;
}
</style>
