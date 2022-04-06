import axios from 'axios'
import errorInterceptor from './serverErrors'
import { LocalStorage } from 'quasar'

const api = axios.create({ baseURL: 'http://192.168.2.189:3015' })

api.interceptors.response.use(function (response) {
  return response
}, errorInterceptor)

const addBererToken = token => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

const token = LocalStorage.getItem('token')
if (token) addBererToken(token)

export { axios, api, addBererToken }
