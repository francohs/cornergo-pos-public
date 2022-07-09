import { defineStore } from 'pinia'
import { baseState, baseGetters, baseActions } from './base'
import { api } from 'boot/axios'

export const useEmittedDtes = defineStore({
  id: 'emittedDtes',

  state: () => ({
    ...baseState()
  }),

  getters: {
    ...baseGetters()
  },

  actions: {
    ...baseActions(),
    async create(doc) {
      try {
        this.saving = true
        const { data } = await api.post(this.$id, { doc })
        return data.doc
      } catch (error) {
        throw error
      } finally {
        this.saving = false
      }
    },
    async getPayAmounts() {
      try {
        const { data } = await api.get(this.$id + '/payamounts', {
          params: { date: '2022-07-05' }
        })
        return data
      } catch (error) {
        throw error
      }
    }
  }
})
