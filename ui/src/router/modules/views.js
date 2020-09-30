import Login from '@/views/Login.vue'
import WhakapapaIndex from '@/views/WhakapapaIndex.vue'
import WhakapapaShow from '@/views/WhakapapaShow.vue'
import Discovery from '@/views/Discovery.vue'
import ProfileShow from '@/views/ProfileShow.vue'

export default [
  { path: '/login', name: 'login', component: Login },
  { path: '/whakapapa', name: 'whakapapaIndex', component: WhakapapaIndex },
  { path: '/whakapapa/:id', name: 'whakapapaShow', component: WhakapapaShow },
  { path: '/discovery', name: 'discovery', component: Discovery },
  { path: '/profile/:id', name: 'profileShow', component: ProfileShow }
]
