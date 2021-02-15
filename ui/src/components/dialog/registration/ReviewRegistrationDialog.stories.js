import ReviewRegistrationDialog from './ReviewRegistrationDialog'

import store from '@/store'

export default {
  title: 'ReviewRegistrationDialog'
}

export const EmptyDialog = () => ({
  template:
    '<ReviewRegistrationDialog :show="true"/>',
  components: { ReviewRegistrationDialog },
  store
})

export const WithProfile = () => ({
  template:
    '<ReviewRegistrationDialog :show="show" :profile="profile" @submit="submit" @close="close"/>',
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
  components: { ReviewRegistrationDialog },
  store
})
