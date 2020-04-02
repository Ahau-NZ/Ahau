import SearchBar from './SearchBar.vue'
import { personComplete } from '@/mocks/person-profile'

export default {
  title: 'SearchBar'
}

export const NoProps = () => ({
  template: '<SearchBar :nestedWhakapapa="profile"/>',
  data () {
    return {
      profile: personComplete
    }
  },
  components: { SearchBar }
})

export const Label = () => ({
  template: '<SearchBar label="Add description" row/>',
  components: { SearchBar }
})
