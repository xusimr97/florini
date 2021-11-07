import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'
import customer from './customer'
import VuexPersistence from 'vuex-persist'
// import example from './module-example'

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  key: 'flover-app'
})

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      customer
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING,
    plugins: [vuexLocal.plugin]
  })

  return Store
})
