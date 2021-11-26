const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { name: 'home', path: '', component: () => import('pages/Index.vue') },
      {
        name: 'products',
        path: 'products/:category?',
        component: () => import('pages/product/ProductList.vue')
      }
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
      },
      {
        name: 'register',
        path: 'register',
        component: () => import('pages/auth/Register.vue')
      },
      {
        name: 'rememberPassword',
        path: 'remember-password',
        component: () => import('pages/auth/RememberPassword.vue')
      },
      {
        name: 'setPassword',
        path: 'set-password',
        component: () => import('pages/auth/SetPassword.vue')
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
