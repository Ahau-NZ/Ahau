import Archive from './Archive.vue'
import { personComplete, personMinimum } from '@/mocks/person-profile'

export default {
  title: 'Archive'
}

export const Complete = () => ({
  template: '<Archive :profile="selectedProfile"/>',
  data () {
    return {
      selectedProfile: personComplete
    }
  },
  components: { Archive }
})

export const Minimum = () => ({
  template: '<Archive :profile="selectedProfile"/>',
  data () {
    return {
      selectedProfile: personMinimum
    }
  },
  components: { Archive }
})
