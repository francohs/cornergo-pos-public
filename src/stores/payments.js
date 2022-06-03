import { defineStore } from 'pinia'
import { baseState, baseGetters, baseActions } from './base'

export const usePayments = defineStore({
  id: 'payments',

  state: () => ({
    ...baseState()
  }),

  getters: {
    ...baseGetters()
  },

  actions: {
    ...baseActions()
  }
})
