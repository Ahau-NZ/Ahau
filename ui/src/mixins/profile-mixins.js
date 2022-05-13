import { getProfile } from '../store/modules/profile/apollo-helpers'

export default function mapProfileMixins ({ mapMethods, mapApollo }) {
  const customMixin = {}
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
  // TODO cherese 14/12/2021 when this is removed from here, update getProfile to be a method instead
  // and change how it is used in store/modules/profile/index
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
  }
}

const methods = {
}
