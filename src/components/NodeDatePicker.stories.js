import NodeDatePicker from './NodeDatePicker.vue'

export default {
  title: 'NodeDatePicker'
}

// export const NoLabel = () => ({
//   template: '<NodeDatePicker />',
//   components: { NodeDatePicker }
// })

// export const WithLabel = () => ({
//   template: '<NodeDatePicker :label="label"/>',
//   data: () => ({
//     label: 'Date Of Birth'
//   }),
//   components: { NodeDatePicker }
// })

// export const Disabled = () => ({
//   template: '<NodeDatePicker :label="label" :makeDisabled="disabled"/>',
//   data: () => ({
//     label: '25-09-1968',
//     disabled: true
//   }),
//   components: { NodeDatePicker }
// })

// export const Enabled = () => ({
//   template: '<NodeDatePicker required :label="profile.bornAt" @date="profile.bornAt = $event" />',
//   data: () => ({
//     profile: {
//       bornAt: '25-09-1968'
//     }
//   }),
//   components: { NodeDatePicker }
// })

// export const LongDate = () => ({
//   template: '<NodeDatePicker required :label="profile.bornAt" @date="profile.bornAt = $event" :makeDisabled="true" />',
//   data: () => ({
//     profile: {
//       bornAt: '2020-01-13T00:00:00.000Z'
//     }
//   }),
//   components: { NodeDatePicker }
// })

export const bornAtEnabled = () => ({
  template: '<NodeDatePicker required label="Date of Birth" :value="profile.bornAt" @date="profile.bornAt = $event" :makeDisabled="false" />',
  data: () => ({
    profile: {
      bornAt: '2020-01-13'
    }
  }),
  components: { NodeDatePicker }
})

export const bornAtDisabled = () => ({
  template: '<NodeDatePicker required label="Date of Birth" :value="profile.bornAt" @date="profile.bornAt = $event" :makeDisabled="true" />',
  data: () => ({
    profile: {
      bornAt: '2020-01-13'
    }
  }),
  components: { NodeDatePicker }
})

export const emptyEnabled = () => ({
  template: '<NodeDatePicker required label="Date of Birth" :value="profile.bornAt" @date="profile.bornAt = $event" :makeDisabled="false" />',
  data: () => ({
    profile: {
      bornAt: null
    }
  }),
  components: { NodeDatePicker }
})

export const emptyDisabled = () => ({
  template: '<NodeDatePicker required label="Date of Birth" :value="profile.bornAt" @date="profile.bornAt = $event" :makeDisabled="true" />',
  data: () => ({
    profile: {
      bornAt: null
    }
  }),
  components: { NodeDatePicker }
})
