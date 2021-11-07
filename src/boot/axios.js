import { boot } from 'quasar/wrappers'
import axios from 'axios'
import store from '../store/index'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

// const baseUrl = process.env.DEV
//   ? process.env.API.replace(/"/g, '')
//   : `//api.${
//       location.hostname.includes('www.')
//         ? location.hostname.split('www.')[1]
//         : location.hostname
//     }:${location.port}/api/`

// const baseUrl = process.env.DEV
//   ? process.env.API.replace(/"/g, '')
//   : `//api.flover.es/api/`
const api = axios.create({ baseURL: process.env.API.replace(/"/g, '') })

export default boot(({ app, router, store }) => {
  app.config.globalProperties.$axios = api
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  // app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  api.interceptors.request.use(function (config) {
    if (store.state.customer?.token !== '') {
      config.headers.Authorization = store.state.customer?.token
    }
    return config
  })
})

export { api }
