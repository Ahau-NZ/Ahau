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
    '<ReviewRegistrationDialog v-bind="props" @close="close" @submit="submit"/>',
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
      currentNotification: {
        accepted: false,
        applicationId: '%LN0JWIBd+WSPLGIvVApGxmExfqLdlMCNips/+7F/zyA=.sha256',
        applicant: {
          address: '123 My Street',
          aliveInterval: '2019/',
          avatarImage: {
            uri: 'http://localhost:26835/%26Lt%2BIxKQWJI%2FdE3RYSqrB2tSuLJ02qMhmx2ZeI9nljvQ%3D.sha256?unbox=GuPP%2FbjT%2B9r8knTqJbjGqqzcbzez%2FsmpF923R92fyc0%3D.boxs'
          },
          birthOrder: null,
          canEdit: false,
          deceased: null,
          description: null,
          email: null,
          gender: null,
          headerImage: null,
          id: '%+6ZP5Ed+BBOwFtoNFK4fCGaswGTI1kGOdmcvRXRqMlM=.sha256',
          legalName: null,
          city: 'Palmerston north',
          country: 'NZ',
          phone: null,
          preferredName: 'Cherese MacBook 13',
          profession: null,
          recps: null,
          type: 'person'
        },
        group: {
          preferredName: 'Eriepa'
        },
        message: {
          comments: ['tena koe']
        },
        mine: false,
        type: 'response'
      }
    }
  },
  computed: {
    props () {
      return {
        show: true,
        profile: this.profile,
        type: 'review',
        notification: this.currentNotification,
        title: `Request to join ${this.currentNotification.group.preferredName}`
      }
    }
  },
  components: { ReviewRegistrationDialog },
  store
})
