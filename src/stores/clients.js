import { defineStore } from 'pinia'
import { baseState, baseGetters, baseActions } from './base'

export const useClients = defineStore({
  id: 'clients',

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
