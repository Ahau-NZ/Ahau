import Vue from 'vue'
import Router from 'vue-router'

import views from './modules/views'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    ...views,
    { path: '/', redirect: '/login' },
    { path: '/logout', redirect: '/login' },
    { path: '*', redirect: '/' }
  ]
})
