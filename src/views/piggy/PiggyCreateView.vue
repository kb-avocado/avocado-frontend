<template>
  <div class="piggy-create">
    <h1>새 저금 목표 추가</h1>
    <p>여기에 목표 생성 폼이 들어갈 예정입니다.</p>
    <button type="button" @click="goBack">돌아가기</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
function goBack() {
  router.back()
}
</script>

<style scoped>
.piggy-create {
  padding: 22px 20px;
  background: #fff;
  min-height: 100%;
}
.piggy-create h1 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #252a26;
}
.piggy-create p {
  margin: 0;
  color: #777f79;
  font-size: 13px;
}
.piggy-create button {
  margin-top: 16px;
  padding: 12px 16px;
  border: 0;
  border-radius: 10px;
  background: #78b159;
  color: #fff;
  font-weight: 700;
}
</style>
