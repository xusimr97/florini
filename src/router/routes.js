const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'home', path: '', component: () => import('pages/Index.vue') }
    ]
    // meta: {
    //   auth: true
    // }
  },

  // Auth
  {
    path: '/auth',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'login',
        path: 'login',
        component: () => import('pages/auth/Login.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
