import Vue from 'vue'
import 'typeface-roboto'
import App from './App.vue'
import router from './router'
import store from './store'
import { createProvider } from './vue-apollo'
import vuetify from './plugins/vuetify'
import VuejsClipper from 'vuejs-clipper'
// install
Vue.use(VuejsClipper)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  apolloProvider: createProvider(),
  vuetify,
  render: h => h(App)
}).$mount('#app')
