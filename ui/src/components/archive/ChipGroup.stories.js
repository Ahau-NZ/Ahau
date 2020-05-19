import ChipGroup from './ChipGroup.vue'
import { COLLECTIONS } from '@/mocks/collection'

export default {
  title: 'ChipGroup'
}

export const CollectionChip = () => ({
  template: '<ChipGroup :chips="collections"/>',
  data () {
    return {
      collections: COLLECTIONS
    }
  },
  components: { ChipGroup }
})
