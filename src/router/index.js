import { route } from 'quasar/wrappers'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router'
import routes from './routes'
import { useAuth } from 'stores/auth'
import { useCashMoves } from 'stores/cashmoves'
import Notify from 'tools/notify'

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE
    )
  })

  Router.beforeEach(async (to, from, next) => {
    const auth = useAuth()
    const cashMoves = useCashMoves()

    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (auth.isLogged) {
        if (to.name == 'pos') {
          await cashMoves.getLast()

          if (!cashMoves.isOpen) {
            Notify.warning('Primero debes iniciar caja')
            next('/cashmoves')
          } else if (!cashMoves.validDate) {
            Notify.warning('Último cierre de caja fuera de fecha')
            await cashMoves.closeCashBox(auth.user._id)
            auth.logout()
            next('/login')
          } else next()
        } else next()
        // next()
      } else {
        Notify.info('Primero debes ingresar')
        next('/login')
      }
    } else next()
  })

  return Router
})
