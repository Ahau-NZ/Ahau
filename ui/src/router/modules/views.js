import Login from '@/views/Login.vue'
import WhakapapaIndex from '@/views/WhakapapaIndex.vue'
import WhakapapaShow from '@/views/WhakapapaShow.vue'
import Discovery from '@/views/Discovery.vue'
import ProfileShow from '@/views/ProfileShow.vue'
import CollectionShow from '@/views/CollectionShow.vue'

import Profile from '@/components/profile/Profile.vue'
import Archive from '@/components/archive/Archive.vue'
import Timeline from '@/components/story/Timeline.vue'

import ArchiveHome from '@/components/archive/ArchiveHome.vue'

// Unfortunately Vue Router doesn't work without at least a fake component
// If you do only data handling
const EmptyRouterComponent = {
  render (createElement) {
    return createElement('router-view')
  }
}

export default [
  { path: '/login', name: 'login', component: Login },
  { path: '/tribe', name: 'tribe', component: Discovery },
  {
    path: '/tribe/:tribeId',
    component: EmptyRouterComponent,
    children: [
      {
        path: 'person/:profileId',
        component: ProfileShow,
        children: [
          ...sharedRoutes('person')
        ]
      },
      {
        path: 'community/:profileId',
        component: ProfileShow,
        children: [
          ...sharedRoutes('community')
        ]
      }
    ]
  }
]

function sharedRoutes (type) {
  return [
    { path: '', name: type, redirect: 'profile' },
    { path: 'profile', name: `${type}/profile`, component: Profile },
    {
      path: 'archive',
      // name: `${type}/archive`,
      component: Archive,
      props: true,
      children: [
        {
          path: '',
          name: `${type}/archive`,
          component: ArchiveHome
        },
        {
          path: ':collectionId',
          name: `${type}/archive/:collectionId`,
          component: CollectionShow
        }
      ]
    },
    { path: 'timeline', name: `${type}/timeline`, component: Timeline, props: true },
    { path: 'whakapapa', name: `${type}/whakapapa`, component: WhakapapaIndex, props: true },
    { path: 'whakapapa/:whakapapaId', name: `${type}/whakapapa/:whakapapaId`, component: WhakapapaShow }
  ]
}
