import { boot } from 'quasar/wrappers'
import { apolloClient } from './apollo'

export default boot(async ({ app }) => {
  app.provide('apollo', apolloClient)
})
