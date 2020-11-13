import Login from '@/views/Login.vue'
import WhakapapaIndex from '@/views/WhakapapaIndex.vue'
// import WhakapapaShow from '@/views/WhakapapaShow.vue'
import Discovery from '@/views/Discovery.vue'
import ProfileShow from '@/views/ProfileShow.vue'
import Profile from '@/components/profile/Profile.vue'

import Archive from '@/components/archive/Archive.vue'
import Timeline from '@/components/story/Timeline.vue'

export default [
  { path: '/login', name: 'login', component: Login },
  // { path: '/whakapapa', name: 'whakapapaIndex', component: WhakapapaIndex },
  // { path: '/whakapapa/:id', name: 'whakapapaShow', component: WhakapapaShow },
  { path: '/discovery', name: 'discovery', component: Discovery },
  {
    path: '/profileShow/:id',
    component: ProfileShow,
    children: [
      { path: '', name: 'profileShow', redirect: { name: 'profile' } },
      { path: 'profile', name: 'profile', component: Profile },
      // Archive will be rendered inside ProfileShow's <router-view>
      // when /profile/:id/archive is matched
      { path: 'archive', name: 'archive', component: Archive },
      // WhakapapaIndex will be rendered inside ProfileShow's <router-view>
      // when /profile/:id/whakapapa is matched
      { path: 'whakapapa', name: 'whakapapaIndex', component: WhakapapaIndex },
      { path: 'timeline', name: 'timeline', component: Timeline }
    ]
  }
]
