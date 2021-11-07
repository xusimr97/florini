// Import the functions you need from the SDKs you need
import { boot } from 'quasar/wrappers'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCUg1NEa-UbEXyDxgdWmZiJKE4aQuC_ZBg',
  authDomain: 'flover-33a82.firebaseapp.com',
  projectId: 'flover-33a82',
  storageBucket: 'flover-33a82.appspot.com',
  messagingSenderId: '1095509398402',
  appId: '1:1095509398402:web:0100a042c874f13071759b',
  measurementId: 'G-3MXGWBX6WT'
}

// Initialize Firebase
const appFb = initializeApp(firebaseConfig)
const analytics = getAnalytics(appFb)
const auth = getAuth(appFb)

export default boot(({ app, router, store }) => {
  app.config.globalProperties.$auth = auth
})

export { appFb }
