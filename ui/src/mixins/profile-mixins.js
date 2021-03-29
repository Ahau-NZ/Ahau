import { getProfile } from '@/lib/profile-helpers.js'
import { getTribe } from '@/lib/community-helpers.js'
import { savePerson, whakapapaLink } from '@/lib/person-helpers.js'
import { saveLink } from '@/lib/link-helpers.js'
import { saveWhakapapaView } from '@/lib/whakapapa-helpers.js'
import gql from 'graphql-tag'

export default function mapProfileMixins ({ mapMethods, mapApollo }) {
  var customMixin = {}
  if (mapMethods) {
    customMixin.methods = {}

    mapMethods.forEach(m => {
      if (methods[m]) customMixin.methods[m] = methods[m]
    })
  }

  if (mapApollo) {
    customMixin.apollo = {}

    mapApollo.forEach(m => {
      if (apollo[m]) customMixin.apollo[m] = apollo[m]
    })
  }

  return customMixin
}

const apollo = {
  profile () {
    return {
      ...getProfile,
      skip () {
        return this.$route.name === 'tribe' || this.$route.name === 'login' // skip calling this immediately if on the tribe page
      },
      /*
        NOTE: when variables is a function, it is reactive, so when the route profileId changes,
        profile is updated automatically for you
      */
      variables () {
        return {
          id: this.$route.params.profileId
        }
      },
      error (err) {
        console.error('There was an error fetching the profile with id: ', this.$route.params.profileId)
        console.error(err)
      }
    }
  },
  tribe () {
    if (!this.whoami) throw new Error('tribe mixin requires whoami')
    return {
      skip () {
        if (this.$route.name === 'login' || this.$route.name === 'tribe') return true
        if (this.$route.params.tribeId === this.whoami.personal.groupId) {
          this.tribe = {
            id: this.whoami.personal.groupId,
            public: [this.whoami.public.profile],
            private: [this.whoami.personal.profile]
          }
          return true
        }
        return false
      },
      ...getTribe,
      variables () {
        return {
          id: this.$route.params.tribeId
        }
      },
      error: err => console.error('Error getting tribe', err)
    }
  }
}

const methods = {
  async getTribe (id) {
    try {
      if (!this.whoami) throw new Error("the getTribe methods needs whoami. Use vuex.mapGetters(['whoami')")
      if (id === this.whoami.personal.groupId) {
        return {
          groupId: this.whoami.personal.groupId,
          ...this.whoami.personal.profile
        }
      }

      const res = await this.$apollo.query({
        ...getTribe,
        variables: {
          id
        }
      })

      if (res.errors) throw res.errors

      // const tribe = res.data.tribe
      return res.data.tribe
    } catch (err) {
      console.error('Something went wrong while fetching tribe: ', id)
      console.error(err)
    }
  },
  async getProfile (id) {
    try {
      const res = await this.$apollo.query({
        ...getProfile,
        variables: { id }
      })

      if (res.errors) throw res.errors

      return res.data.profile
    } catch (err) {
      console.error('Something went wrong while fetching the profile: ', id)
      console.error(err)
    }
  },
  // method to save a profile (community or person) using apollo
  async saveProfile ($event) {
    try {
      const res = await this.$apollo.mutate({
        mutation: gql`
          mutation($input: ProfileInput!) {
            saveProfile(input: $input)
          }
        `,
        variables: {
          input: $event
        }
      })

      if (res.errors) throw res.errors
      // dont need to return anything for now...
    } catch (err) {
      console.error('Something went wrong while saving the profile: ', $event)
      console.error(err)
    }
  },

  async createPerson (input) {
    try {
      if (!input.type) throw new Error('profile.type is required on createPerson()')
      if (!input.recps) throw new Error('profile.recps is required on createPerson()')
      if (!input.authors) throw new Error('profile.authors is required on createPerson()')
      if (input.id) throw new Error('profile.id is not allowed on createPerson()')

      return this.savePerson(input) // profileId
    } catch (err) {
      console.error('Something went wrong while trying to create a person', input)
      console.error(err)
    }
  },
  async updatePerson (input) {
    try {
      if (!input.id) throw new Error('profile.id is required on updatePerson()')
      if (input.recps) throw new Error('profile.recps is not allowed on updatePerson()')
      if (input.authors) throw new Error('cannot update authors field')
      if (input.type) throw new Error('profile.type is not allowed on updatePerson()')

      return this.savePerson(input) // profileId
    } catch (err) {
      console.error('Something went wrong while trying to update a person', input)
      console.error(err)
    }
  },
  async savePerson (input) {
    try {
      const res = await this.$apollo.mutate(
        savePerson(input)
      )

      if (res.errors) throw res.errors

      return res.data.saveProfile // profileId
    } catch (err) {
      console.error('Something went wrong while trying to save a person', input)
      console.error(err)
    }
  },
  async saveLink (input) {
    try {
      const res = await this.$apollo.mutate(
        saveLink(input)
      )

      if (res.errors) throw res.errors

      // return res.data.saveLink // linkId
    } catch (err) {
      console.error('Something went wrong while trying to save a link', input)
      console.error(err)
    }
  },
  async saveWhakapapa (input) {
    try {
      const res = await this.$apollo.mutate(
        saveWhakapapaView(input)
      )

      if (res.errors) throw res.errors

      return res.data.saveWhakapapaView
    } catch (err) {
      console.error('Something went wrong while trying to save a whakapapa', input)
      console.error(err)
    }
  },
  async getWhakapapaLink (parent, child) {
    try {
      const res = await this.$apollo.query(
        whakapapaLink(parent, child)
      )

      if (res.errors) throw res.errors

      return res.data.whakapapaLink
    } catch (err) {
      console.error('Something went wrong while trying to get a whakapapa link')
      console.error(err)
    }
  }
}
