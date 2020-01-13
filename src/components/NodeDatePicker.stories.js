import NodeDatePicker from './NodeDatePicker.vue'

export default {
  title: 'NodeDatePicker'
}

export const NoLabel = () => ({
  template: '<NodeDatePicker />',
  components: { NodeDatePicker }
})

export const WithLabel = () => ({
  template: '<NodeDatePicker :label="label"/>',
  data: () => ({
    label: 'Date Of Birth'
  }),
  components: { NodeDatePicker }
})

export const Disabled = () => ({
  template: '<NodeDatePicker :label="label" :makeDisabled="disabled"/>',
  data: () => ({
    label: '25-09-1968',
    disabled: true
  }),
  components: { NodeDatePicker }
})

export const Enabled = () => ({
  template: '<NodeDatePicker required :label="profile.bornAt" @date="profile.bornAt = $event" />',
  data: () => ({
    profile: {
      bornAt: '25-09-1968'
    }
  }),
  components: { NodeDatePicker }
})
