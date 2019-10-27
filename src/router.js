import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/views/Login.vue'

import Profiles from '@/views/Profiles.vue'
import ProfileShow from '@/views/ProfileShow.vue'
import ProfileEdit from '@/views/ProfileEdit.vue'

import Communities from '@/views/Communities.vue'
import CommunityNew from '@/views/CommunityNew.vue'
import CommunityShow from '@/views/CommunityShow.vue'
import CommunityEdit from '@/views/CommunityEdit.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: Login },
    { path: '/logout', redirect: '/login' },

    { path: '/profile', name: 'profileIndex', component: Profiles },
    { path: '/profile/:id/edit', name: 'profileEdit', component: ProfileEdit },
    { path: '/profile/:id', name: 'profileShow', component: ProfileShow },
    { path: '/community', name: 'communityIndex', component: Communities },
    { path: '/community/new', name: 'communityNew', component: CommunityNew },
    { path: '/community/:id/edit', name: 'communityEdit', component: CommunityEdit },
    { path: '/community/:id', name: 'communityShow', component: CommunityShow },
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
