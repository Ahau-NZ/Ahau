import NewCommunityDialog from './NewCommunityDialog.vue'
import store from '@/store'

export default {
  title: 'NewCommunityDialog'
}

export const NewCommunity = () => ({
  template: '<NewCommunityDialog show />',
  components: { NewCommunityDialog },
  store
})
