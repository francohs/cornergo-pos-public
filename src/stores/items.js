import { defineStore } from 'pinia'
import { baseState, baseGetters, baseActions } from './base'

export const useItems = defineStore({
  id: 'items',

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
