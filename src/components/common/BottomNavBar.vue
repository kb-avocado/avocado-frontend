<template>
  <nav
    class="relative z-50 flex items-end justify-between border-t border-gray-100 bg-white px-2 pb-3 pt-2"
    aria-label="하단 메뉴"
  >
    <RouterLink
      v-for="item in leftItems"
      :key="item.key"
      :to="item.to"
      class="flex-1 flex flex-col items-center gap-1"
    >
      <span
        class="flex items-center justify-center px-3 py-1 rounded-full"
        :class="isActive(item) ? 'bg-avocado-100' : ''"
      >
        <component
          :is="item.icon"
          :size="18"
          :class="isActive(item) ? 'text-avocado-600' : 'text-muted'"
        />
      </span>

      <span class="text-[11px]" :class="isActive(item) ? 'text-avocado-600' : 'text-muted'">
        {{ item.label }}
      </span>
    </RouterLink>

    <RouterLink :to="centerItem.to" class="flex-1 flex flex-col items-center gap-1 -mt-6">
      <span
        class="w-[52px] h-[52px] rounded-2xl bg-avocado-600 flex items-center justify-center shadow-md"
      >
        <component :is="centerItem.icon" :size="22" class="text-white" />
      </span>

      <span class="text-[11px]" :class="isActive(centerItem) ? 'text-avocado-600' : 'text-muted'">
        {{ centerItem.label }}
      </span>
    </RouterLink>

    <RouterLink
      v-for="item in rightItems"
      :key="item.key"
      :to="item.to"
      class="flex-1 flex flex-col items-center gap-1"
    >
      <span
        class="flex items-center justify-center px-3 py-1 rounded-full"
        :class="isActive(item) ? 'bg-avocado-100' : ''"
      >
        <component
          :is="item.icon"
          :size="18"
          :class="isActive(item) ? 'text-avocado-600' : 'text-muted'"
        />
      </span>

      <span class="text-[11px]" :class="isActive(item) ? 'text-avocado-600' : 'text-muted'">
        {{ item.label }}
      </span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Home, PiggyBank, LayoutGrid, Send, Newspaper, PieChart } from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()

// route.meta.audience는 이미 부모 전용 화면(childId가 URL에 있는 화면)에 들어간 "이후"에만 채워진다.
// /home처럼 아직 그런 화면에 들어가기 전인 곳에서 첫 진입 링크를 만들 때는
// 로그인 응답에 실려온 실제 회원 유형(authStore.user.type)으로 판단해야 한다.
const isParent = computed(() => authStore.user?.type === 'PARENT')

// URL에 이미 childId가 있으면 그걸 우선 쓰고(아이를 여러 명 둔 부모가 특정 아이 화면에 있는 경우),
// 없으면 로그인 시 내려온 연결된 아이 목록 중 첫 번째를 기본값으로 쓴다.
// 연결된 아이가 아예 없으면 빈 문자열 → 부모용 라우트에 childId 없이 진입(각 화면이 "연결된 아이 없음"을 보여줌).
const childId = computed(() => String(route.params.childId ?? authStore.user?.child?.[0]?.id ?? ''))

// 부모이면서 아이가 없을 때도, "아이용 화면"이 아니라 "부모용 화면(연결된 아이 없음 안내)"으로 보내야 한다.
// 그래서 폴백을 { name: 'piggy' } 같은 아이 전용 라우트가 아니라, childId 없는 parent-* 라우트로 바꾼다.
function parentOrChildTarget(parentName, childName) {
  if (!isParent.value) {
    return { name: childName }
  }

  return childId.value
    ? { name: parentName, params: { childId: childId.value } }
    : { name: parentName }
}

const leftItems = computed(() => [
  {
    key: 'home',
    menu: 'home',
    label: '홈',
    icon: Home,
    to: parentOrChildTarget('parent-home', 'home')
  },
  {
    key: 'piggy',
    menu: 'piggy',
    label: '저금통',
    icon: PiggyBank,
    to: parentOrChildTarget('parent-piggy-list', 'piggy')
  }
])

const centerItem = computed(() => {
  if (isParent.value) {
    return {
      key: 'transfer',
      menu: 'transfer',
      label: '용돈 보내기',
      icon: Send,
      to: childId.value
        ? {
            name: 'parent-transfer',
            params: {
              childId: childId.value
            }
          }
        : {
            name: 'home'
          }
    }
  }

  return {
    key: 'payment',
    menu: 'wallet',
    label: '결제하기',
    icon: LayoutGrid,
    to: {
      name: 'wallet'
    }
  }
})

const rightItems = computed(() => [
  {
    key: 'newspaper',
    menu: 'newspaper',
    label: '신문',
    icon: Newspaper,
    to: parentOrChildTarget('parent-newspaper', 'newspaper')
  },
  {
    key: 'report',
    menu: 'report',
    label: '리포트',
    icon: PieChart,
    to: parentOrChildTarget('parent-report', 'child-report')
  }
])

function isActive(item) {
  return route.meta.menu === item.menu || route.name === item.to?.name
}
</script>
