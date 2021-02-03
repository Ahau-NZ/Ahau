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

export const EditCommunity = () => ({
  template: '<NewCommunityDialog show editing :profile="formData" :title="title" />',
  components: { NewCommunityDialog },
  data () {
    return {
      title: 'Edit Eriepa',
      formData: {
        id: '%A',
        preferredName: 'Eriepa',
        description: 'This is a community for the Eriepa Whanau',
        address: '123 Far far away',
        email: 'eriepawhanau@email.co.nz',
        phone: '021 123 4556',
        location: 'Waikato, New Zealand'
      }
    }
  },
  store
})
