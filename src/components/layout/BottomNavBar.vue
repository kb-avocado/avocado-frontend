<template>
  <nav
    class="flex items-end justify-between px-2 pt-2 pb-3 bg-white border-t border-gray-100"
  >
    <RouterLink
      v-for="item in leftItems"
      :key="item.name"
      :to="{ name: item.name }"
      class="flex-1 flex flex-col items-center gap-1"
    >
      <span
        class="flex items-center justify-center px-3 py-1 rounded-full"
        :class="isActive(item.name) ? 'bg-avocado-100' : ''"
      >
        <component
          :is="item.icon"
          :size="18"
          :class="isActive(item.name) ? 'text-avocado-600' : 'text-muted'"
        />
      </span>
      <span
        class="text-[11px]"
        :class="isActive(item.name) ? 'text-avocado-600' : 'text-muted'"
      >
        {{ item.label }}
      </span>
    </RouterLink>

    <RouterLink
      :to="{ name: centerItem.name }"
      class="flex-1 flex flex-col items-center gap-1 -mt-6"
    >
      <span
        class="w-[52px] h-[52px] rounded-2xl bg-avocado-600 flex items-center justify-center"
      >
        <component :is="centerItem.icon" :size="22" class="text-white" />
      </span>
      <span
        class="text-[11px]"
        :class="isActive(centerItem.name) ? 'text-avocado-600' : 'text-muted'"
      >
        {{ centerItem.label }}
      </span>
    </RouterLink>

    <RouterLink
      v-for="item in rightItems"
      :key="item.name"
      :to="{ name: item.name }"
      class="flex-1 flex flex-col items-center gap-1"
    >
      <span
        class="flex items-center justify-center px-3 py-1 rounded-full"
        :class="isActive(item.name) ? 'bg-avocado-100' : ''"
      >
        <component
          :is="item.icon"
          :size="18"
          :class="isActive(item.name) ? 'text-avocado-600' : 'text-muted'"
        />
      </span>
      <span
        class="text-[11px]"
        :class="isActive(item.name) ? 'text-avocado-600' : 'text-muted'"
      >
        {{ item.label }}
      </span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { Home, PiggyBank, LayoutGrid, Newspaper, PieChart } from 'lucide-vue-next'

const route = useRoute()

const leftItems = [
  { name: 'home', label: '홈', icon: Home },
  { name: 'piggy', label: '저금통', icon: PiggyBank },
]
const centerItem = { name: 'wallet', label: '결제하기', icon: LayoutGrid }
const rightItems = [
  { name: 'newspaper', label: '신문', icon: Newspaper },
  { name: 'report', label: '리포트', icon: PieChart },
]

function isActive(routeName) {
  return route.name === routeName
}
</script>