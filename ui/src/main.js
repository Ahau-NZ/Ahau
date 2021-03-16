import Vue from 'vue'
import VuexRouterSync from 'vuex-router-sync'
import VuejsClipper from 'vuejs-clipper'
import gql from 'graphql-tag'
import VueZoomer from 'vue-zoomer'

import App from './App.vue'
import router from './router'
import store from './store/index'

import { apolloProvider } from './plugins/vue-apollo'
import vuetify from './plugins/vuetify'
import CordovaBackButton from './plugins/cordova-back-button'
import nodejsClient from './plugins/cordova-nodejs-client.js'

const isCordova = process.env.VUE_APP_PLATFORM === 'cordova'

if (isCordova) {
  document.addEventListener('deviceready', main, false)
} else {
  main()
}

VuexRouterSync.sync(store, router)

async function main () {
  function startVue () {
    new Vue({
      router,
      store,

      apolloProvider,
      vuetify,

      render: h => h(App)
    }).$mount('#app')
  }

  // install
  Vue.use(VuejsClipper)
  Vue.use(VueZoomer)
  Vue.use(CordovaBackButton, { router })
  Vue.config.productionTip = false

  if (isCordova) {
    nodejsClient.start({
      onReady: () => {
        console.log('nodejs-mobile and GraphQL server are fully ready')
        startVue()
        navigator.splashscreen.hide()
      }
    })
    return
  }

  checkReady(() => { startVue() })

  async function checkReady (next) {
    try {
      await apolloProvider.defaultClient.query({
        query: gql`{
          whoami {
            public {
              feedId
            }
          }
        }`
      })
    } catch (e) {
      console.log('Waiting for Graphql')
      return setTimeout(() => checkReady(next), 500)
    }

    next()
  }
}
