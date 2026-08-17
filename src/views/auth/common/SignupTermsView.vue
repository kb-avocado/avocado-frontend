<script setup>
import { computed, ref } from 'vue'
import { NavigationFailureType, useRouter } from 'vue-router'
import { useSignupStore } from '@/stores/signup'
import BaseButton from '@/components/common/BaseButton.vue'
import SignupHeader from '@/components/common/SignupHeader.vue'

const router = useRouter()
const signupStore = useSignupStore()

// 약관 본문 주소. 아직 문서가 없어서 자리만 잡아뒀고, 준비되면 이 값만 바꾸면 된다.
const TERM_URLS = {
  service: '#',
  privacy: '#',
  guardian: '#'
}

// 전부 필수 항목이라 선택 동의는 두지 않는다.
// 아이는 만 14세 미만일 수 있어 법정 대리인 동의가 하나 더 붙는다.
const terms = computed(() => {
  const items = [
    { key: 'service', label: '아보카도 이용 약관' },
    { key: 'privacy', label: '개인정보 수집 및 이용 동의' }
  ]

  if (signupStore.type === 'CHILD') {
    items.push({
      key: 'guardian',
      label: '법정 대리인 동의',
      note: '만 14세 미만은 법정 대리인의 동의가 필요합니다.'
    })
  }

  return items.map((item) => ({ ...item, url: TERM_URLS[item.key] }))
})

const checked = ref({})

const allChecked = computed(() => terms.value.every((term) => checked.value[term.key]))

function toggleAll() {
  // 이미 다 켜져 있으면 끄고, 아니면 전부 켠다.
  const next = !allChecked.value
  terms.value.forEach((term) => {
    checked.value[term.key] = next
  })
}

function handleNext() {
  if (!allChecked.value) return

  signupStore.setAgreed(true)
  router.push({ name: 'signup-profile' })
}
</script>

<template>
  <main class="min-h-screen" style="background-color: var(--color-avocado-50)">
    <SignupHeader title="회원가입" @click-back="router.back()" />

    <section class="mx-auto flex w-full max-w-md flex-col gap-8 px-6 pb-12 pt-10">
      <!-- 타이틀 -->
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-bold leading-snug" style="color: var(--color-text-primary)">
          약관에 동의해주세요
        </h2>
        <p class="text-sm" style="color: var(--color-text-secondary)">
          아보카도를 이용하려면 아래 항목에 모두 동의해야 해요.
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <!-- 모두 동의 -->
        <button type="button" class="agree-all" @click="toggleAll">
          <span class="check-mark" :class="{ 'check-mark--on': allChecked }">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2.5 7.5L5.5 10.5L11.5 4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="text-base font-semibold" style="color: var(--color-text-primary)">
            약관에 모두 동의합니다
          </span>
        </button>

        <!-- 개별 항목 -->
        <ul class="flex flex-col gap-1">
          <li v-for="term in terms" :key="term.key" class="term-row">
            <!-- 체크는 라벨 안쪽만 담당한다. 상세 버튼까지 감싸면 버튼을 눌러도 체크가 토글된다. -->
            <label class="term-row__label">
              <input v-model="checked[term.key]" type="checkbox" class="sr-only" />
              <span
                class="check-mark check-mark--sm"
                :class="{ 'check-mark--on': checked[term.key] }"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7.5L5.5 10.5L11.5 4"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <span class="flex flex-col gap-0.5">
                <span class="text-sm" style="color: var(--color-text-primary)">
                  <span class="required-tag">[필수]</span>
                  {{ term.label }}
                </span>
                <span v-if="term.note" class="text-xs" style="color: var(--color-text-secondary)">
                  {{ term.note }}
                </span>
              </span>
            </label>

            <!-- 가입 도중에 페이지를 벗어나면 입력하던 내용이 날아가므로 새 탭에서 연다. -->
            <a
              :href="null"
              target="_blank"
              rel="noopener noreferrer"
              class="term-detail-link"
              :aria-label="`${term.label} 전문 보기 (새 창)`"
            >
              전문 보기
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M5.5 2.5H2.5v9h9v-3"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M8.5 2.5h3v3M11.5 2.5L6.5 7.5"
                  stroke="currentColor"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
          </li>
        </ul>
      </div>

      <!-- 다음으로 버튼 -->
      <BaseButton class="w-full" :disabled="!allChecked" @click="handleNext">다음으로</BaseButton>
    </section>
  </main>
</template>

<style scoped>
.agree-all {
  display: flex;
  width: 100%;
  cursor: pointer;
  align-items: center;
  gap: 0.75rem;
  border-radius: var(--radius-card);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  padding: 1rem;
  text-align: left;
  transition: border-color 0.15s;
}

.agree-all:hover {
  border-color: var(--color-avocado-300);
}

.agree-all:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-avocado-300) 50%, transparent);
}

.term-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  border-radius: var(--radius-card);
  padding: 0.625rem 1rem;
}

.term-row:hover {
  background-color: var(--color-avocado-100);
}

.term-row__label {
  display: flex;
  flex: 1;
  cursor: pointer;
  align-items: flex-start;
  gap: 0.75rem;
}

/* 밑줄과 초록색으로 '누를 수 있는 링크'라는 것을 분명히 한다.
   옆의 아이콘은 새 창으로 열린다는 신호다. */
.term-detail-link {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.25rem;
  border-radius: 0.5rem;
  padding: 0.125rem 0.25rem;
  /* 두 줄짜리 항목에서도 첫 줄과 눈높이가 맞도록 살짝 내린다. */
  margin-top: 0.125rem;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--color-avocado-600);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition:
    background-color 0.15s,
    text-decoration-thickness 0.15s;
}

.term-detail-link:hover {
  background-color: var(--color-avocado-100);
  text-decoration-thickness: 2px;
}

.term-detail-link:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-avocado-300) 50%, transparent);
}

/* 체크 표시. 꺼져 있을 때는 테두리와 회색 체크만 보인다. */
.check-mark {
  display: flex;
  height: 1.5rem;
  width: 1.5rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text-muted);
  transition:
    background-color 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.check-mark--sm {
  height: 1.25rem;
  width: 1.25rem;
  /* 두 줄짜리 항목에서도 첫 줄 글자와 눈높이가 맞도록 살짝 내린다. */
  margin-top: 0.125rem;
}

.check-mark--on {
  border-color: var(--color-avocado-600);
  background-color: var(--color-avocado-600);
  color: var(--color-surface);
}

/* 키보드로 체크박스에 포커스했을 때도 표시가 보이게 한다. */
.term-row__label input:focus-visible + .check-mark {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-avocado-300) 50%, transparent);
}

.required-tag {
  font-weight: 600;
  color: var(--color-avocado-600);
}
</style>
