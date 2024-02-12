import Vue from 'vue'
import VuexRouterSync from 'vuex-router-sync'
import VueRx from 'vue-rx'
import VuejsClipper from 'vuejs-clipper/dist/vuejs-clipper.umd.js'
import 'vuejs-clipper/dist/vuejs-clipper.css'
import VueZoomer from 'vue-zoomer'
import gql from 'graphql-tag'

import App from './App.vue'
import router from './router'
import store from './store/index'

import apolloProvider from './plugins/vue-apollo'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'
import CordovaBackButton from './plugins/cordova-back-button'
import nodejsClient from './plugins/cordova-nodejs-client'

import { isCordova } from './lib/cordova-helpers'

if (isCordova()) {
  console.log('starting up, waiting for "deviceready"')
  document.addEventListener('deviceready', main, false)
} else {
  main()
}

VuexRouterSync.sync(store, router)

async function main () {
  function startVue () {
    new Vue({
      name: 'AhauMain',
      router,
      store,

      apolloProvider,
      vuetify,
      i18n,

      render: h => h(App)
    }).$mount('#app')
  }

  // install
  Vue.use(VueRx) // peer dependency of vuejs-clipper
  Vue.use(VuejsClipper)
  Vue.use(VueZoomer)
  Vue.use(CordovaBackButton, { router })
  Vue.config.productionTip = false

  if (isCordova()) {
    nodejsClient.start({
      onReady () {
        // console.log('nodejs-mobile and GraphQL server are fully ready')
        startVue()
        navigator.splashscreen.hide()
      },
      onAnyMessage (msg) {
        console.log(msg)
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
      // eslint-disable-next-line no-console
      console.log('Waiting for Graphql')
      return setTimeout(() => checkReady(next), 500)
    }

    next()
  }
}
