<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ username: '', password: '' })

async function handleSubmit() {
  const { data } = await login(form.value)
  authStore.setAuth({ token: data.accessToken, userInfo: data.user })
  router.push({ name: 'wallet' })
}
</script>

<template>
  <section class="mx-auto mt-20 max-w-sm">
    <h1 class="mb-6 text-xl font-bold">로그인</h1>
    <form class="flex flex-col gap-3" @submit.prevent="handleSubmit">
      <input v-model="form.username" type="text" placeholder="아이디" class="rounded border p-2" />
      <input v-model="form.password" type="password" placeholder="비밀번호" class="rounded border p-2" />
      <button type="submit" class="rounded bg-primary p-2 text-white">로그인</button>
    </form>
  </section>
</template>
