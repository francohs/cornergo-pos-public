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
    user: LocalStorage.getItem('user'),
    token: LocalStorage.getItem('token'),
    loading: false
  }),

  getters: {
    isLogged() {
      return this.token !== null
    }
  },

  actions: {
    async login() {
      try {
        this.loading = true

        const { data } = await api.post(`${this.$id}/login`, this.credentials)

        this.user = data.user
        this.token = data.token
        LocalStorage.set('user', this.user)
        LocalStorage.set('token', this.token)
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
      LocalStorage.remove('username')
      LocalStorage.remove('token')
    }
  }
})
