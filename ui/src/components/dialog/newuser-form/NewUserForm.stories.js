import NewUserForm from './NewUserForm.vue'
import { personComplete } from '@/mocks/person-profile'

export default {
  title: 'NewUserForm'
}

export const ViewNewUser = () => ({
  template: '<NewUserForm :profile="selectedProfile" :readonly="true"/>',
  data () {
    return {
      selectedProfile: personComplete
    }
  },
  components: { NewUserForm }
})

export const EditNewUser = () => ({
  template: '<NewUserForm :profile="selectedProfile"/>',
  data () {
    return {
      selectedProfile: personComplete
    }
  },
  components: { NewUserForm }
})

