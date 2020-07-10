import ProfileSearchBar from './ProfileSearchBar.vue'
import { personComplete } from '@/mocks/person-profile'

export default {
  title: 'ProfileSearchBar'
}

export const SearchBar = () => ({
  template: '<ProfileSearchBar label="Mentions" :selectedItems.sync="selectedItems" :items="items" :searchString.sync="searchString" />',
  data () {
    return {
      selectedItems: [],
      searchString: '',
      items: [
        personComplete,
        ...personComplete.children,
        ...personComplete.parents,
        ...personComplete.siblings
      ]
    }
  },
  components: { ProfileSearchBar }
})
