import Vue from 'vue'
import Router from 'vue-router'

import Dashboard from '@/views/Dashboard.vue'

import Login from '@/views/Login.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', name: 'login', component: Login },
    { path: '/logout', redirect: '/login' },

    { path: '/dashboard', name: 'dashboard', component: Dashboard },

    { path: '*', redirect: '/' }
  ]
})

// NOTE the below fanciness breaks at the moment in production
// don't think it's really needed anyway because all the code is local right?
// maybe it helps with memory though?

// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.
// component: () => import([> webpackChunkName: "about" <] './views/About.vue')
