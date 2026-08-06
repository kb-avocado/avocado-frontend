import { defineStore } from 'pinia'

function createInitialState() {
  return {
    recipient: null,
    amount: 0
  }
}

export const useTransferStore = defineStore('transfer', {
  state: createInitialState,

  actions: {
    setRecipient(recipient) {
      this.recipient = recipient
    },

    setAmount(amount) {
      this.amount = amount
    },

    reset() {
      Object.assign(this, createInitialState())
    }
  }
})
