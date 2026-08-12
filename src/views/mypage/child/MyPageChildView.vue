<template>
  <div class="flex min-h-full flex-col gap-4 bg-gray-50 p-4">
    <!-- ── 조회 중 ── -->
    <div v-if="phase === 'loading'" class="flex flex-1 items-center justify-center py-16">
      <span
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-avocado-300 border-t-transparent"
      />
    </div>

    <!-- ── 조회 실패 ── -->
    <div
      v-else-if="phase === 'error'"
      class="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <span class="text-4xl">😥</span>
      <p class="text-sm text-muted">내 정보를 불러오지 못했어요.</p>
      <button
        type="button"
        class="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700"
        @click="fetchMyPage"
      >
        다시 시도
      </button>
    </div>

    <!-- ── 조회 완료 ── -->
    <template v-else-if="phase === 'loaded'">
      <ProfileCard :name="myPage.name" user-type="어린이" :email="myPage.email" />

      <ConnectedParent
        v-if="myPage.parentName"
        :parent-name="myPage.parentName"
        :parent-email="myPage.parentEmail"
      />

      <!-- 아직 보호자와 연결되지 않은 아이 계정. 서버가 보호자 정보를 아예 내려주지 않는다. -->
      <section v-else class="rounded-2xl bg-avocado-100 p-5">
        <p class="flex items-center gap-2 text-sm font-bold text-gray-900">
          <Users :size="16" class="text-avocado-600" />
          연결된 보호자
        </p>

        <p class="mt-3 rounded-xl bg-white px-4 py-3 text-sm text-muted">
          아직 연결된 보호자가 없어요.
        </p>

        <RouterLink
          :to="{ name: 'family-connect' }"
          class="mt-3 flex items-center justify-center rounded-xl bg-avocado-600 px-4 py-2.5 text-sm font-medium text-white"
        >
          보호자 연결하기
        </RouterLink>
      </section>

      <MenuList :items="menuItems" />

      <LogoutButton class="mt-4" />

      <p class="text-center text-xs text-muted">회원탈퇴</p>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Settings, Headphones, Users } from 'lucide-vue-next'

import { getMyPage } from '@/api/user'
import ProfileCard from '@/components/mypage/ProfileCard.vue'
import ConnectedParent from '@/components/mypage/ConnectedParent.vue'
import MenuList from '@/components/mypage/MenuList.vue'
import LogoutButton from '@/components/mypage/LogoutButton.vue'

const router = useRouter()

// 'loading' | 'loaded' | 'error'
const phase = ref('loading')
const myPage = ref({ name: '', email: '', parentName: '', parentEmail: '' })

async function fetchMyPage() {
  phase.value = 'loading'

  try {
    const { data: response } = await getMyPage()
    const me = response.data

    // 보호자 계정이 이 주소로 들어온 경우 보호자 화면으로 되돌린다.
    if (me.type !== 'CHILD') {
      router.replace({ name: 'mypageParent' })
      return
    }

    myPage.value = me
    phase.value = 'loaded'
  } catch {
    // 401은 axios 인터셉터가 로그인 화면으로 보낸다.
    phase.value = 'error'
  }
}

const menuItems = [
  { key: 'app-settings', label: '앱 설정', icon: Settings },
  { key: 'support', label: '고객센터', icon: Headphones }
]

onMounted(() => {
  fetchMyPage()
})
</script>
