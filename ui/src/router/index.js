import Vue from 'vue'
import Router from 'vue-router'

import views from './modules/views'
// import dialogs from './modules/dialogs'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    ...views,
    // ...dialogs,
    { path: '/', redirect: '/login' },
    { path: '/logout', redirect: '' },
    { path: '*', redirect: '/' }
  ]
})
