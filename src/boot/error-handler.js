import { boot } from 'quasar/wrappers'
import { i18n } from './i18n'

export default boot(({ app }) => {
  /*
  window.onunhandledrejection = function (event) {
    if (event.reason.response.data.error) {
      errorHandler(event.reason)
      event.preventDefault()
    }
  }
  */
  app.config.errorHandler = (err, vm, info) => {
    errorHandler(err, vm)
  }

  app.config.globalProperties.errorHandler = errorHandler

  function errorHandler (err, vm) {
    let message
    const res = err.response
    console.log(res)


    if (res) {
      const status = res.status

      if (status === 403) {
        vm.$router.push('/login')
      }
      if (status === 401) {
        vm.$router.push('/login')
      }

      if (status >= 400 && status < 500) {
        if (res.data.error.code) {
          message = i18n.global.t(res.data.error.code)
        } else {
          message = res.data.error.message
        }
      } else if (status >= 500) {
        message = i18n.global.t('internalServerError')
      }
    } else {
      message = i18n.global.t('somethingWentWrong')
      console.error(err)
    }

    vm.$q.notify({
      message: message,
      type: 'negative'
    })
  }
})
