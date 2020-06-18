import NodeDatePicker from './NodeDatePicker.vue'

export default {
  title: 'NodeDatePicker'
}

export const aliveIntervalEnabled = () => ({
  template:
    '<NodeDatePicker label="Date of Birth" :value.sync="profile.aliveInterval" />',
  data: () => ({
    profile: {
      aliveInterval: '2020-01-13/'
    }
  }),
  watch: {
    'profile.aliveInterval' (newValue) {
      console.log(newValue)
    }
  },
  components: { NodeDatePicker }
})
