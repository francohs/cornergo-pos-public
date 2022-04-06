import { defineStore } from 'pinia'
import { baseState, baseGetters, baseActions } from './base'
import { api } from 'src/boot/axios'
import notify from 'src/tools/notify'

export const useUsers = defineStore({
  id: 'users',

  state: () => ({
    ...baseState()
  }),

  getters: {
    ...baseGetters()
  },

  actions: {
    ...baseActions(),

    async updatePassword(id, doc) {
      try {
        this.saving = true
        await api.patch(`${this.$id}/${id}/password`, {
          doc
        })
        notify.positive('Constraseña modificada con éxito')
      } catch (error) {
        throw error
      } finally {
        this.saving = false
      }
    }
  }
})
