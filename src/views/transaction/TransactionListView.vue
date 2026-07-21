<script setup>
import { ref, onMounted } from 'vue'
import { getTransactions } from '@/api/transaction'

const transactions = ref([])

onMounted(async () => {
  const { data } = await getTransactions()
  transactions.value = data
})
</script>

<template>
  <section>
    <h1 class="mb-2 text-lg font-semibold">거래 내역</h1>
    <ul>
      <li v-for="tx in transactions" :key="tx.id">{{ tx.description }} - {{ tx.amount }}</li>
    </ul>
  </section>
</template>
