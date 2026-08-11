<template>
  <div class="flex min-h-full flex-col gap-4 bg-gray-50 p-4">
    <ProfileCard :name="user.name" :user-type="user.userType" :email="user.email" />

    <ConnectedParent :parent-name="parent.name" :parent-email="parent.email" />

    <MenuList :items="menuItems" />

    <LogoutButton class="mt-4" />

    <p class="text-center text-xs text-muted">회원탈퇴</p>
  </div>
</template>

<script setup>
import { Settings, Headphones } from 'lucide-vue-next'

import ProfileCard from '@/components/mypage/ProfileCard.vue'
import ConnectedParent from '@/components/mypage/ConnectedParent.vue'
import MenuList from '@/components/mypage/MenuList.vue'
import LogoutButton from '@/components/mypage/LogoutButton.vue'

// TODO: 로그인/마이페이지 API 붙이면 실제 사용자 정보로 교체
const user = {
  name: '홍길동',
  userType: '어린이',
  email: 'child@avocado.com'
}

const parent = {
  name: '홍보호',
  email: 'parent@avocado.com'
}

const menuItems = [
  { key: 'app-settings', label: '앱 설정', icon: Settings },
  { key: 'support', label: '고객센터', icon: Headphones }
]
</script>
