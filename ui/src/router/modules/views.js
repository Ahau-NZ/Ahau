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
  {
    path: '/tribe',
    name: 'tribe',
    component: Discovery
  },
  // {
  //   path: '/person/:profileId',
  //   name: 'person',
  //   // component: ProfileShow,
  //   children: [
  //     { path: 'profile', name: 'profile/person', component: Profile }
  //   ]
  // },
  // {
  //   path: '/community/:profileId',
  //   name: 'community',
  //   // component: ProfileShow,
  //   children: [
  //     { path: 'profile', name: 'profile/community', component: Profile }
  //   ]
  // },
  {
    path: '/tribe/:tribeId',
    component: ProfileShow,
    children: [
      {
        path: 'person/:profileId',
        name: 'person',
        component: Profile
      },
      {
        path: 'community/:profileId',
        name: 'community',
        component: Profile
      },
      {
        path: 'archive',
        name: 'archive',
        component: Archive,
        props: true
      },
      {
        path: 'timeline',
        name: 'timeline',
        component: Timeline,
        props: true
      },
      {
        path: 'whakapapa',
        name: 'whakapapa',
        component: WhakapapaIndex,
        props: true
      },
      {
        path: 'whakapapa/:whakapapaId',
        name: 'whakapapaShow',
        component: WhakapapaShow
      }
    ]
  }
]
/*
TODO:
- separate profile/person + profile/community
- archive:
  - personal archive: profile/:profileId/archive
  - tribe archive / community archive
  - person archive:

/tribe                                        - the index page for all tribes (current discovery I think?)

/tribe/new                                              - new community
X /tribe/:tribeId/community/:profileId
      /tribe/:tribeId/community/:profileId/edit
/tribe/:tribeId/whakapapa                               - index of all the whakapapa views for a particular tribe
/tribe/:tribeId/whakapapa/:whakapapaId                  -
/tribe/:tribeId/whakapapa/:whakapapaId/edit
/tribe/:tribeId/whakapapa/new
                           - archive of a tribe

/tribe/:tribeId/person/new                              - new person within a particular tribe
X /tribe/:tribeId/person/:profileId                       - shows a person within a particular tribe
/tribe/:tribeId/person/:profileId/edit

/tribe/:tribeId/person/:profileId/story

/tribe/:tribeId/person/:profileId/whakapapa
/tribe/:tribeId/person/:profileId/timeline

/tribe/:tribeId/story/:storyId
/tribe/:tribeId/story/:storyId/edit
/tribe/:tribeId/story/new
// NOTE: these are actually stories
X /tribe/:tribeId/timeline
X /tribe/:tribeId/archive

/person/:profileId - a public person profile
/community/:profileId - a public community profile

Login goes to your profile

tribe/myTribe/profile/myProfile

*/
