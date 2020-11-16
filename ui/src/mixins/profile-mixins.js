import { getProfile } from '@/lib/person-helpers.js'

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
    console.log(this.$route.params)
    return {
      ...getProfile,
      variables () {
        return {
          id: this.$route.params.profileId
        }
      },
      update: data => data.person
    }
  }
}

const methods = {
}
