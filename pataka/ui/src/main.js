import Vue from 'vue'
import gql from 'graphql-tag'
import VuejsClipper from 'vuejs-clipper'

import App from './App.vue'
import router from './router'
import store from './store'

import { createProvider } from './plugins/vue-apollo'
import vuetify from './plugins/vuetify'

main()

async function main () {
  // install
  Vue.use(VuejsClipper)
  Vue.config.productionTip = false

  const apolloProvider = createProvider()

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
