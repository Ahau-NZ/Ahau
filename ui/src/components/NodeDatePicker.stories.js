import NodeDatePicker from './NodeDatePicker.vue'

export default {
  title: 'NodeDatePicker'
}

export const bornAtEnabled = () => ({
  template:
    '<NodeDatePicker label="Date of Birth" :value.sync="profile.bornAt" />',
  data: () => ({
    profile: {
      bornAt: '2020-01-13'
    }
  }),
  watch: {
    'profile.bornAt' (newValue) {
      console.log(newValue)
    }
  },
  components: { NodeDatePicker }
})

export const bornAtDisabled = () => ({
  template:
    '<NodeDatePicker required label="Date of Birth" :value="profile.bornAt" @date="profile.bornAt = $event" :readonly="true" />',
  data: () => ({
    profile: {
      bornAt: '2020-01-13'
    }
  }),
  components: { NodeDatePicker }
})

export const emptyEnabled = () => ({
  template:
    '<NodeDatePicker required label="Date of Birth" :value="profile.bornAt" @date="profile.bornAt = $event" :makeDisabled="false" />',
  data: () => ({
    profile: {
      bornAt: null
    }
  }),
  components: { NodeDatePicker }
})

export const emptyDisabled = () => ({
  template:
    '<NodeDatePicker required label="Date of Birth" :value="profile.bornAt" @date="profile.bornAt = $event" :makeDisabled="true" />',
  data: () => ({
    profile: {
      bornAt: null
    }
  }),
  components: { NodeDatePicker }
})
