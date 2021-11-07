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

  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      {
        name: 'login',
        path: '',
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
