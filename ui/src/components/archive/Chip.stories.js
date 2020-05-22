import Chip from './Chip.vue'
import { collectionComplete } from '@/mocks/collections'

export default {
  title: 'Chip'
}

export const CollectionChip = () => ({
  template: '<Chip :title="collection.title" :description="collection.description" :image="collection.image"/>',
  data () {
    return {
      collection: collectionComplete
    }
  },
  components: { Chip }
})
