import NewArtefactDialog from './NewArtefactDialog.vue'
import { story1 } from '@/mocks/stories'

export default {
  title: 'NewArtefactDialog'
}

export const Complete = () => ({
  template: '<NewArtefactDialog :show="true" :story="story" />',
  data () {
    return {
      story: story1
    }
  },
  components: { NewArtefactDialog }
})
