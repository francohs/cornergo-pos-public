import { defineStore } from 'pinia'
import { baseState, baseGetters, baseActions } from './base'

export const useVouchers = defineStore({
  id: 'vouchers',

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
