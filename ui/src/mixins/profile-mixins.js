import { getProfile } from '@/lib/profile-helpers.js'
import { getTribe } from '../store/modules/tribe/apollo-helpers'
import { whakapapaLink } from '@/lib/person-helpers.js'
import { saveLink } from '@/lib/link-helpers.js'

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
  async getWhakapapaLink (parent, child, isPartner) {
    try {
      const res = await this.$apollo.query(
        whakapapaLink(parent, child, isPartner)
      )
      if (res.errors) throw res.errors

      return res.data.whakapapaLink
    } catch (err) {
      console.error('Something went wrong while trying to get a whakapapa link')
      console.error(err)
    }
  }
}
