import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useCafs = defineStore({
  id: 'cafs',

  state: () => ({
    currentNumber: null
  }),

  actions: {
    async getCurrentNumber() {
      try {
        const { data } = await api.get('cafs/current')
        this.currentNumber = data.currentNumber
      } catch (error) {
        throw error
      }
    }
  }
})
