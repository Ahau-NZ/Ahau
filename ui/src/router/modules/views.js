import Login from '@/views/Login.vue'
import WhakapapaIndex from '@/views/WhakapapaIndex.vue'
import WhakapapaShow from '@/views/WhakapapaShow.vue'
import Discovery from '@/views/Discovery.vue'
import ProfileShow from '@/views/ProfileShow.vue'
import Profile from '@/components/profile/Profile.vue'

import Archive from '@/components/archive/Archive.vue'
import Timeline from '@/components/story/Timeline.vue'

export default [
  { path: '/login', name: 'login', component: Login },
  // { path: '/whakapapa', name: 'whakapapaIndex', component: WhakapapaIndex },
  // { path: '/discovery', name: 'discovery', component: Discovery },
  // {
  //   path: '/profileShow/:id',
  //   component: ProfileShow,
  //   children: [
  //     { path: '', name: 'profileShow', redirect: 'profile' },
  //     { path: 'profile', name: 'profile', component: Profile },
  //     // Archive will be rendered inside ProfileShow's <router-view>
  //     // when /profile/:id/archive is matched
  //     { path: 'archive', name: 'archive', component: Archive },
  //     // WhakapapaIndex will be rendered inside ProfileShow's <router-view>
  //     // when /profile/:id/whakapapa is matched
  //     {
  //       path: 'whakapapa',
  //       name: 'whakapapaIndex',
  //       component: WhakapapaIndex,
  //       children: [
  //         { path: 'whakapapa/:whakapapaId', name: 'whakapapaShow', component: WhakapapaShow }
  //       ]
  //     },

  //     { path: 'timeline', name: 'timeline', component: Timeline }
  //   ]
  // }
  {
    path: '/tribes',
    name: 'tribes',
    component: Discovery,
    children: [
      {
        path: 'tribe/:tribeId',
        name: 'tribe',
        component: ProfileShow
      }
    ]
  },
  {
    path: '/tribe/:tribeId',
    component: ProfileShow,
    children: [
      {
        path: '',
        name: 'profileShow',
        redirect: 'profile'
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
        path: 'whakapapaIndex',
        name: 'whakapapaIndex',
        component: WhakapapaIndex
      }
    ]
  }
]

/*
/tribes                                        - the index page for all tribes (current discovery I think?)
/tribe/:tribeId                               - community home page
/tribe/:tribeId/edit                          - editing the community page
/tribe/:tribeId/archive                       - archive of a community

/tribe/:tribeId/profile/:profileId     - shows a profile in a particular tribe context
/tribe/:tribeId/profile/:profileId/home     - some overview with links out to archive / whakapapa / timeline?
/tribe/:tribeId/profile/:profileId/archive
/tribe/:tribeId/profile/:profileId/archive/new

/tribe/:tribeId/whakapapa  - index of all the whakapapa views for a particular tribe
/tribe/:tribeId/whakapapa/:whakapapaId
/tribe/:tribeId/whakapapa/:whakapapaId/edit
*/
