import ChipGroup from './ChipGroup.vue'
import { firstMocks } from '@/mocks/collections'

export default {
  title: 'ChipGroup'
}

export const CollectionChip = () => ({
  template: '<ChipGroup :chips="collections"/>',
  data () {
    return {
      collections: firstMocks
    }
  },
  components: { ChipGroup }
})
