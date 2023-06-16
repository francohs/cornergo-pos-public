import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { api, addBererToken } from 'src/boot/axios'

export const useAuth = defineStore({
  id: 'auth',

  state: () => ({
    credentials: {
      username: '',
      password: ''
    },
    user: process.env.DEV ? LocalStorage.getItem('user') : null,
    token: process.env.DEV ? LocalStorage.getItem('token') : null,
    loading: false
  }),

  getters: {
    isLogged() {
      return this.user !== null
    }
  },

  actions: {
    async login() {
      try {
        this.loading = true

        const { data } = await api.post(`${this.$id}/login`, this.credentials)

        console.log()

        this.user = data.user
        this.token = data.token

        if (process.env.DEV) {
          LocalStorage.set('user', this.user)
          LocalStorage.set('token', this.token)
        }

        addBererToken(this.token)
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.user = null
      this.token = null

      if (process.env.DEV) {
        LocalStorage.remove('username')
        LocalStorage.remove('token')
      }
    }
  }
})
