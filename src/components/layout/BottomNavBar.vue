<template>
  <nav
    class="flex items-end justify-between px-2 pt-2 pb-3 bg-white border-t border-gray-100"
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

const route = useRoute()

const isParent = computed(() => route.meta.audience === 'parent')

const childId = computed(() => String(route.params.childId ?? ''))

const leftItems = computed(() => [
  {
    key: 'home',
    menu: 'home',
    label: '홈',
    icon: Home,
    to: {
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
    to: {
      name: 'newspaper'
    }
  },
  {
    key: 'report',
    menu: 'report',
    label: '리포트',
    icon: PieChart,
    to: {
      name: 'report'
    }
  }
])

function isActive(item) {
  return route.meta.menu === item.menu || route.name === item.to?.name
}
</script>
