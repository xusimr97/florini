import { boot } from 'quasar/wrappers'
import { i18n } from './i18n'
// i18n.global.t('code')

export default boot(({ app }) => {
  app.config.globalProperties.$general = {
    localeOptions: [
      { label: i18n.global.t('es'), value: 'es' },
      { label: i18n.global.t('en'), value: 'en' }
    ],
    stateOptions: [
      { label: i18n.global.t('published'), value: true },
      { label: i18n.global.t('hidden'), value: false }
    ],
    shippingStateOptions: [
      { label: i18n.global.t('pending'), value: 0 },
      { label: i18n.global.t('completed'), value: 1 },
      { label: i18n.global.t('canceled'), value: 2 }
    ],
    postTypeOptions: [
      { label: i18n.global.t('post'), value: 'post' },
      { label: i18n.global.t('slider'), value: 'slider' }
    ]
  }
})
