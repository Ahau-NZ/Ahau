import { getProfile } from '@/lib/person-helpers.js'
import { getTribe } from '@/lib/community-helpers.js'

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
    // determine whether its a community or a profile
    return {
      ...getProfile,
      skip () {
        return this.$route.name === 'tribe' // skip calling this immediately if on the tribe page
      },
      variables () {
        return {
          id: this.$route.params.profileId
        }
      },
      error: err => console.log('ERROR GETTING PROFILE...', err),
      update: data => {
        return data.person
      }
    }
  },
  tribe () {
    return {
      skip () {
        return this.$route.params.tribeId === this.whoami.personal.groupId
      },
      ...getTribe,
      variables () {
        return {
          id: this.$route.params.tribeId
        }
      },
      error: err => console.error('Error getting tribe', err),
      update ({ tribe }) {
        if (tribe.private.length > 0) return { groupId: tribe.id, ...tribe.private[0] }
        return { groupId: tribe.id, ...tribe.public[0] }
      }
    }
  }
}

const methods = {
  async getTribe (id) {
    try {
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

      const tribe = res.data.tribe

      return {
        id: tribe.id,
        ...(tribe.private.length > 0 ? tribe.private[0] : tribe.public[0])
      }
    } catch (err) {
      console.error('Something went wrong while fetching tribe: ', id)
      console.error('Error', err)
    }
  }
}
