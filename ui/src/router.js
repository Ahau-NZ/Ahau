import Vue from 'vue'
import Router from 'vue-router'

import WhakapapaIndex from '@/views/WhakapapaIndex.vue'
import WhakapapaShow from '@/views/WhakapapaShow.vue'

import Discovery from '@/views/Discovery.vue'

// import People from '@/views/People.vue'
import ProfileShow from '@/views/ProfileShow.vue'
// import ProfileEdit from '@/views/ProfileEdit.vue'

// import CommunityNew from '@/views/CommunityNew.vue'
// import CommunityShow from '@/views/CommunityShow.vue'
// import CommunityEdit from '@/views/CommunityEdit.vue'

// import StoryShow from '@/views/StoryShow.vue'

// import Archive from '@/components/archive/Archive.vue'

import Login from '@/views/Login.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: Login },
    { path: '/logout', redirect: '/login' },

    { path: '/whakapapa', name: 'whakapapaIndex', component: WhakapapaIndex },
    { path: '/whakapapa/:id', name: 'whakapapaShow', component: WhakapapaShow },

    { path: '/discovery', name: 'discovery', component: Discovery },

    // { path: '/person', name: 'personIndex', component: People },
    // { path: '/profile/:id/edit', name: 'profileEdit', component: ProfileEdit },
    { path: '/profile/:id', name: 'profileShow', component: ProfileShow },

    // { path: '/story/:id', name: 'story', component: StoryShow },

    // { path: '/community/new', name: 'communityNew', component: CommunityNew },
    // {
    //   path: '/community/:id/edit',
    //   name: 'communityEdit',
    //   component: CommunityEdit
    // },
    // { path: '/community/:id', name: 'communityShow', component: CommunityShow },

    // { path: '/archive/:id', name: 'archive', component: Archive },

    { path: '*', redirect: '/' }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

// NOTE the below fanciness breaks at the moment in production
// don't think it's really needed anyway because all the code is local right?
// maybe it helps with memory though?

// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.
// component: () => import([> webpackChunkName: "about" <] './views/About.vue')