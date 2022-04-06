import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  app.config.errorHandler = (error, vm, info) => {
    console.error(`[${info}] ${error}`)
  }
})
