import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/views/Login.vue'

import People from '@/views/People.vue'
import PersonShow from '@/views/PersonShow.vue'
import PersonEdit from '@/views/PersonEdit.vue'

import Discovery from '@/views/Discovery.vue'
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

    { path: '/person', name: 'personIndex', component: People },
    { path: '/person/:id/edit', name: 'personEdit', component: PersonEdit },
    { path: '/person/:id', name: 'personShow', component: PersonShow },
    { path: '/discovery', name: 'discovery', component: Discovery },
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
