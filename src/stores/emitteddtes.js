import { defineStore } from 'pinia'
import { baseState, baseGetters, baseActions } from './base'
import { api } from 'boot/axios'
import notify from 'tools/notify'

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
    async generate(doc) {
      try {
        this.saving = true
        const { data } = await api.post(this.$id + '/generate', { doc })
        return data.doc
      } catch (error) {
        throw error
      }
    },
    async create(doc) {
      try {
        const { data } = await api.post(this.$id, { doc })
        notify.positive('Se generó Boleta Electrónica ' + data.doc.number)
        return data.doc
      } catch (error) {
        throw error
      } finally {
        this.saving = false
      }
    },
    async getPayments(dates) {
      try {
        const { data } = await api.post(this.$id + '/payments', { dates })
        return data
      } catch (error) {
        throw error
      }
    }
  }
})
