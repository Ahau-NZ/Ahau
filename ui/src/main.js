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

if (process.env.VUE_APP_PLATFORM === 'cordova') {
  document.addEventListener('deviceready', main, false)
} else {
  main()
}

VuexRouterSync.sync(store, router)

async function main () {
  // install
  Vue.use(VueZoomer)
  Vue.use(VuejsClipper)
  Vue.use(CordovaBackButton, { router })
  Vue.config.productionTip = false

  checkReady(() => {
    new Vue({
      router,
      store,

      apolloProvider,
      vuetify,

      render: h => h(App)
    }).$mount('#app')
  })

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
