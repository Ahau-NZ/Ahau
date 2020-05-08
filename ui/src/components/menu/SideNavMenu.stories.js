import SideNavMenu from './SideNavMenu.vue'
import { personComplete, personMinimum } from '@/mocks/person-profile'

export default {
  title: 'SideNavMenu'
}

export const Complete = () => ({
  template: '<SideNavMenu :profile="selectedProfile" show-avatar/>',
  data () {
    return {
      selectedProfile: personComplete
    }
  },
  components: { SideNavMenu }
})

export const Minimum = () => ({
  template: '<SideNavMenu :profile="selectedProfile"/>',
  data () {
    return {
      selectedProfile: personMinimum
    }
  },
  components: { SideNavMenu }
})
