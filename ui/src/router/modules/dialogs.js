// import Dialog from '@/dialogs/Dialog.vue'
import NewNodeDialog from '@/components/dialog/profile/NewNodeDialog.vue'

export default [
  // { path: '/dialog', name: 'dialog', component: Dialog },
  { path: '', name: 'new-node-dialog', component: NewNodeDialog, props: { show: true } }
]

/*
routes:

- user:id
  - profile -> automatically redirects to this page, with your own profile/id
  - archive
  - whakapapa
  - timeline
- discovery
- login

ways to route:
- app bar -> will always route to your own archive/whakapapa/profile
  - tribes/discovery
  - archive
  - whakapapa
  - profile

- side nav bar -> can route to yours as well as someone elses
  - profile
  - archive
  - timeline
  - whakapapa
  - NOTES
    - needs to keep the sidebar alive...?
    - where should this functionality sit

*/
