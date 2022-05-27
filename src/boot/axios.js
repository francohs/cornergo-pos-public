import axios from 'axios'
import { LocalStorage } from 'quasar'
import notify from 'tools/notify'
import { boot } from 'quasar/wrappers'
import { useAuth } from '../stores/auth'

const api = axios.create({ baseURL: 'http://localhost:3015' })
// const api = axios.create({ baseURL: 'http://192.168.2.189:3015' })

const ServerErrors = {
  NotFound: 'El usuario no existe',
  Unauthorized: 'Acceso no autorizado',
  AuthTokenIncorrect: 'Acceso no autorizado',
  AuthTokenMissing: 'Sesion expirada',
  IncorrectPassword: 'Contraseña incorrecta'
}

const TokenErrors = ['Unauthorized', 'AuthTokenIncorrect', 'AuthTokenMissing']

export default boot(({ router, store }) => {
  api.interceptors.response.use(
    function (response) {
      return response
    },
    axiosError => {
      console.error(axiosError.response)

      if (axiosError.response) {
        if (axiosError.response.data) {
          const error = axiosError.response.data.error
          console.error(error)

          if (Object.keys(ServerErrors).includes(error)) {
            notify.negative(ServerErrors[error])

            if (TokenErrors.includes(error)) {
              const auth = useAuth(store)
              auth.logout()
              router.push({ name: 'login' })
            }
          }
        }
      }

      return Promise.reject(axiosError)
    }
  )
})

const addBererToken = token => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

const token = LocalStorage.getItem('token')
if (token) addBererToken(token)

export { axios, api, addBererToken }
