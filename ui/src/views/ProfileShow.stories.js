import ProfileShow from './ProfileShow.vue'
import { personComplete, personMinimum } from '@/mocks/person-profile'
export default {
  title: 'ProfileShow'
}

export const Complete = () => ({
  template: '<ProfileShow :selectedProfile="selectedProfile"/>',
  data () {
    return {
      selectedProfile: personComplete
    }
  },
  components: { ProfileShow }
})

export const Minimum = () => ({
  template: '<ProfileShow :selectedProfile="selectedProfile"/>',
  data () {
    return {
      selectedProfile: personMinimum
    }
  },
  components: { ProfileShow }
})
