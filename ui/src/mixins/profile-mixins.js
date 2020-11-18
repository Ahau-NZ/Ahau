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
      ...getTribe(this.$route.params.tribeId),
      error: err => console.error('Error getting tribe', err),
      update ({ tribe }) {
        if (tribe.private.length > 0) return { groupId: tribe.id, ...tribe.private[0] }
        return { groupId: tribe.id, ...tribe.public[0] }
      }
    }
  }
}

const methods = {
}
