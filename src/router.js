import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Profile from './views/Profile.vue'
import Edit from './views/Edit.vue'
import Communities from './views/Communities.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/edit',
      name: 'edit',
      component: Edit
    },
    {
      path: '/communities',
      name: 'communities',
      component: Communities

      // NOTE the below fanciness breaks at the moment in production
      // don't think it's really needed anyway because all the code is local right?
      // maybe it helps with memory though?

      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      // component: () => import([> webpackChunkName: "about" <] './views/About.vue')
    }
  ]
})
