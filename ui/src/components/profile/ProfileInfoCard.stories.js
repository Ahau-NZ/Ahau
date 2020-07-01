import ProfileInfoCard from './ProfileInfoCard.vue'
import { personComplete, personMinimum } from '@/mocks/person-profile'
export default {
  title: 'ProfileInfoCard'
}

export const Complete = () => ({
  template: '<ProfileInfoCard :profile="selectedProfile"/>',
  data () {
    return {
      selectedProfile: personComplete
    }
  },
  components: { ProfileInfoCard }
})

export const Minimum = () => ({
  template: '<ProfileInfoCard :profile="selectedProfile"/>',
  data () {
    return {
      selectedProfile: personMinimum
    }
  },
  components: { ProfileInfoCard }
})
