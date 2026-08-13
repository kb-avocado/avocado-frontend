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
import { Home, PiggyBank, LayoutGrid, Send, Newspaper, PieChart } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

// route.meta.audience는 이미 부모 전용 화면(childId가 URL에 있는 화면)에 들어간 "이후"에만 채워진다.
// /home처럼 아직 그런 화면에 들어가기 전인 곳에서 첫 진입 링크를 만들 때는
// 로그인 응답에 실려온 실제 회원 유형(authStore.user.type)으로 판단해야 한다.
const isParent = computed(() => authStore.user?.type === 'PARENT')

// URL에 이미 childId가 있으면 그걸 우선 쓰고(아이를 여러 명 둔 부모가 특정 아이 화면에 있는 경우),
// 없으면 로그인 시 내려온 연결된 아이 목록 중 첫 번째를 기본값으로 쓴다.
const childId = computed(() => String(route.params.childId ?? authStore.user?.child?.[0]?.id ?? ''))

const leftItems = computed(() => [
  {
    key: 'home',
    menu: 'home',
    label: '홈',
    icon: Home,
    to:
      isParent.value && childId.value
        ? {
            name: 'parent-home',
            params: {
              childId: childId.value
            }
          }
        : {
            name: 'home'
          }
  },
  {
    key: 'piggy',
    menu: 'piggy',
    label: '저금통',
    icon: PiggyBank,
    to:
      isParent.value && childId.value
        ? {
            name: 'parent-piggy-list',
            params: {
              childId: childId.value
            }
          }
        : {
            name: 'piggy'
          }
  }
])

const centerItem = computed(() => {
  if (isParent.value) {
    return {
      key: 'transfer',
      menu: 'wallet',
      label: '송금하기',
      icon: Send,
      to: {
        name: 'wallet',
        query: {
          mode: 'transfer',
          childId: childId.value || undefined
        }
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
    to:
      isParent.value && childId.value
        ? {
            name: 'parent-newspaper',
            params: {
              childId: childId.value
            }
          }
        : {
            name: 'newspaper'
          }
  },
  {
    key: 'report',
    menu: 'report',
    label: '리포트',
    icon: PieChart,
    to:
      isParent.value && childId.value
        ? {
            name: 'parent-report',
            params: {
              childId: childId.value
            }
          }
        : {
            name: 'child-report'
          }
  }
])

function isActive(item) {
  return route.meta.menu === item.menu || route.name === item.to?.name
}
</script>
