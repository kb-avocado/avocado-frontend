<template>
  <div class="min-h-full flex flex-col items-center justify-center gap-4 px-6">
    <p class="text-sm text-gray-500">연결된 아이가 없습니다.</p>

    <RouterLink
      :to="{ name: 'mypageParent' }"
      class="bg-avocado-600 text-white text-sm font-medium px-5 py-3 rounded-full"
    >
      아이 연결하러 가기
    </RouterLink>
  </div>
</template>