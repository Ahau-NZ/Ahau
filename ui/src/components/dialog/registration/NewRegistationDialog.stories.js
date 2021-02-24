import NewRegistrationDialog from './NewRegistrationDialog'

import store from '@/store'

export default {
  title: 'NewRegistrationDialog'
}

export const EmptyDialog = () => ({
  template:
    '<NewRegistrationDialog :show="true"/>',
  components: { NewRegistrationDialog },
  store
})

export const WithProfile = () => ({
  template:
    '<NewRegistrationDialog :show="show" :profile="profile" @submit="submit" @close="close"/>',
  methods: {
    submit ($event) {
      console.log('Text', $event)
    },
    close () {
      this.show = false
    }
  },
  data () {
    return {
      show: true,
      profile: {
        preferredName: 'Cats',
        joiningQuestions: [
          { type: 'input', label: 'What is your name?' },
          { type: 'input', label: 'Where were you born?' },
          { type: 'input', label: 'Where abouts do you live?' }
        ]
      }
    }
  },
  components: { NewRegistrationDialog },
  store
})
