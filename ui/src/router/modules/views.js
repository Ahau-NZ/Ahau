import Login from '@/views/Login.vue'
import WhakapapaIndex from '@/views/WhakapapaIndex.vue'
import WhakapapaShow from '@/views/WhakapapaShow.vue'
import Discovery from '@/views/Discovery.vue'
import ProfileShow from '@/views/ProfileShow.vue'
import Profile from '@/components/profile/Profile.vue'

import Archive from '@/components/archive/Archive.vue'
import Timeline from '@/components/story/Timeline.vue'

// Unfortunately Vue Router doesn't work without at least a fake component
// If you do only data handling
const EmptyRouterComponent = {
  render (createElement) {
    return createElement('router-view')
  }
}

export default [
  { path: '/login', name: 'login', component: Login },
  {
    path: '/tribe',
    name: 'tribe',
    component: Discovery
  },
  {
    path: '/tribe/:tribeId',
    component: EmptyRouterComponent,
    children: [
      {
        path: 'person/:profileId',
        component: ProfileShow,
        children: [
          {
            path: '', name: 'person', redirect: 'profile'
          },
          {
            path: 'profile',
            name: 'profile',
            component: Profile
          },
          {
            path: 'archive',
            name: 'archive',
            component: Archive
          },
          {
            path: 'timeline',
            name: 'timeline',
            component: Timeline
          },
          {
            path: 'whakapapa',
            name: 'whakapapa',
            component: WhakapapaIndex
          },
          {
            path: 'whakapapa/:whakapapaId',
            name: 'whakapapa/:whakapapaId',
            component: WhakapapaShow
          }
        ]
      },
      // {
      //   path: 'community/:profileId',
      //   component: ProfileShow,
      //   children: [
      //     {
      //       path: '', name: 'community', redirect: 'profile'
      //     },
      //     {
      //       path: 'profile',
      //       name: 'profile',
      //       component: Profile
      //     },
      //     {
      //       path: 'archive',
      //       name: 'archive',
      //       component: Archive
      //     },
      //     {
      //       path: 'timeline',
      //       name: 'timeline',
      //       component: Timeline
      //     },
      //     {
      //       path: 'whakapapa',
      //       name: 'whakapapa',
      //       component: WhakapapaIndex
      //     },
      //     {
      //       path: 'whakapapa/:whakapapaId',
      //       name: 'whakapapa/:whakapapaId',
      //       component: WhakapapaShow
      //     }
      //   ]
      // }
    ]
  }
]
