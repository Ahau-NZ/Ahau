import ProfileForm from './ProfileForm.vue'
import { personComplete } from '@/mocks/person-profile'

export default {
  title: 'ProfileForm'
}

export const ViewProfileForm = () => ({
  template: '<ProfileForm :profile="selectedProfile" :readonly="true"/>',
  data () {
    return {
      selectedProfile: personComplete
    }
  },
  components: { ProfileForm }
})

export const EditProfileForm = () => ({
  template: '<ProfileForm :profile="selectedProfile"/>',
  data () {
    return {
      selectedProfile: personComplete
    }
  },
  components: { ProfileForm }
})

export const NewProfileForm = () => ({
  template: '<ProfileForm />',
  components: { ProfileForm }
})
