import ArtefactCarousel from './ArtefactCarousel.vue'
import { artefacts } from './node_modules/@/mocks/artefacts'

export default {
  title: 'ArtefactCarousel'
}

export const Complete = () => ({
  template: '<ArtefactCarousel :artefacts="artefacts" />',
  data () {
    return {
      artefacts: artefacts
    }
  },
  components: { ArtefactCarousel }
})
