import { getProfile } from '@/lib/person-helpers.js'
import { getTribe } from '@/lib/community-helpers.js'
import tree from '@/lib/tree-helpers.js'

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
  },
  async setSelectedProfile (profile) {
    if (profile === null) {
      this.updateSelectedProfile({})
      return
    }
    // check the type of profile we received
    if (typeof profile === 'object') {
      profile = await this.loadKnownFamily(true, profile)
      if (profile.parents.length) {
        // find parent to get any changes to siblings
        var person = await tree.find(this.nestedWhakapapa, profile.parents[0].id)
        if (!person) {
          this.updateSelectedProfile(profile)
          return
        }
        var updatedProfile = tree.getSiblings(person, profile)
        this.updateSelectedProfile(updatedProfile)
      } else this.updateSelectedProfile(profile)
    } else if (typeof profile === 'string') {
      // need to find the profile in this whakapapa
      var profileFound = await tree.find(this.nestedWhakapapa, profile)
      if (!profileFound) {
        // lets load descendants of them instead
        const partner = await this.loadDescendants(profile, '', [])
        partner.isPartner = true
        console.warn('could potentially be loading a large amount of data')
        this.updateSelectedProfile(partner)
        return
      }
      if (profileFound.parents.length) {
        // find parent to get any changes to siblings
        var parent = await tree.find(this.nestedWhakapapa, profileFound.parents[0].id)
        // if parent not found is becuase that parent is not in this nestedWhakapapa
        if (!parent) {
          this.updateSelectedProfile(profileFound)
          return
        }
        var newUpdatedProfile = tree.getSiblings(parent, profileFound)
        this.updateSelectedProfile(newUpdatedProfile)
      } else this.updateSelectedProfile(profileFound)
    } else {
      this.updateSelectedProfile({})
    }
  },
}
