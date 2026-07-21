<script setup>
import { onMounted } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { formatCurrency } from '@/utils/format'

const walletStore = useWalletStore()

onMounted(() => {
  walletStore.fetchBalance()
})
</script>

<template>
  <section>
    <h1 class="mb-2 text-lg font-semibold">내 지갑</h1>
    <p class="text-2xl font-bold">{{ formatCurrency(walletStore.balance) }}</p>
  </section>
</template>
