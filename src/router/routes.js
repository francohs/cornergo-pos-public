import loadRoutes from './loader'

const routesNotRequiresAuth = ['login', 'items', 'items/create']

const pages = loadRoutes().map(route => ({
  ...route,
  meta: {
    requiresAuth: !routesNotRequiresAuth.includes(route.name)
  }
}))

const routes = [
  {
    path: '/',
    component: () => import('components/Layouts/LayoutMain.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/_home.vue')
      },
      ...pages
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/_error404.vue')
  }
]

export default routes
