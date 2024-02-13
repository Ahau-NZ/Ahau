import Login from '@/views/Login.vue'
import WhakapapaIndex from '@/views/WhakapapaIndex.vue'
import WhakapapaShow from '@/views/WhakapapaShow.vue'
import Discovery from '@/views/Discovery.vue'
import ProfileShow from '@/views/ProfileShow.vue' // this is a tribe container?
import CollectionShow from '@/views/CollectionShow.vue'

import Profile from '@/components/profile/Profile.vue' // this is ProfileShow
import Archive from '@/components/archive/Archive.vue'

import PersonIndex from '@/views/PersonIndex.vue'
import WalletShow from '@/components/wallet/WalletShow.vue'

// Unfortunately Vue Router doesn't work without at least a fake component
// If you do only data handling
const EmptyRouterComponent = {
  render (createElement) {
    return createElement('router-view')
  }
}

/* TODO change the routes + views to be like
     /tribe                - list of all tribes (public/ private?)
     /tribe/:tribeId       - tribe show (shows community profile)
     /tribe/:tribeId/edit  - edit the community profile/ settings
     /tribe/:tribeId/new   - for creating a new tribe

     // RESTful routes

     /tribe/:tribeId/whakapapa                - index (list all records)
     /tribe/:tribeId/whakapapa/new            - new
     /tribe/:tribeId/whakapapa/:whakapapaId   - show
     /tribe/:tribeId/whakapapa/edit           - edit

     // then same for each of these (index, new, show, edit):

     /tribe/:tribeId/person
     /tribe/:tribeId/archive
     /tribe/:tribeId/collection
     /tribe/:tribeId/story

     // NOTE for archive, collection, story etc can provide params
     // to filter the records by e.g  /tribe/:tribeId/archive?profileId=%mixId
*/

export default [
  { path: '/login', name: 'login', component: Login },
  { path: '/tribe', name: 'tribe', component: Discovery },
  {
    path: '/tribe/:tribeId',
    component: EmptyRouterComponent,
    children: [
      {
        path: 'community/:profileId',
        component: ProfileShow, // (T_T) this has got to change
        children: [
          ...sharedRoutes('community'),
          { path: 'person', name: 'personIndex', component: PersonIndex }
        ]
      },
      {
        path: 'person/:profileId',
        component: ProfileShow,
        children: [
          ...sharedRoutes('person')
        ]
      }
    ]
  }
]

function sharedRoutes (type) {
  return [
    { path: '', name: type, redirect: 'profile' },
    { path: 'profile', name: `${type}/profile`, component: Profile }, // CommunityShow PersonShow
    {
      path: 'archive',
      name: `${type}/archive`, // CommunityArchive / PersonArchive
      component: Archive,
      props: true
    },
    {
      path: 'collection/:collectionId', // CollectionShow (doesn't need to be community/person scoped)
      name: `${type}/collection`,
      component: CollectionShow
    },
    { path: 'whakapapa', name: `${type}/whakapapa`, component: WhakapapaIndex, props: true },
    { path: 'whakapapa/:whakapapaId', name: `${type}/whakapapa/:whakapapaId`, component: WhakapapaShow },
    // TODO change "name" to be 'whakapapaShow'
    { path: 'wallet', name: `${type}/wallet`, component: WalletShow }
  ]
}
