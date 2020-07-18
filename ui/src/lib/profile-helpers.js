import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import pick from 'lodash.pick'

const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

export const PERMITTED_PROFILE_ATTRS = [
  // WARNING: make sure header and avatar images are the first two
  'headerImage',
  'avatarImage',
  'id',
  'gender',
  'legalName',
  'aliveInterval',
  'preferredName',
  'description',
  'altNames',
  'birthOrder',
  'location',
  'email',
  'phone',
  'address',
  'profession',
  'deceased',
  'type'
]

export const PERMITTED_PUBLIC_PROFILE_ATTRS = [
  'id',
  'preferredName',
  'avatarImage'
]

export const PERMITTED_RELATIONSHIP_ATTRS = [
  'relationshipType',
  'legallyAdopted'
]

export const PROFILE_FRAGMENT = gql`
  fragment ProfileFragment on Person {
    ${PERMITTED_PROFILE_ATTRS.slice(2)}
    avatarImage { uri }
    headerImage { uri }
  }
`

export const whoami = ({
  query: gql`
    ${PROFILE_FRAGMENT}
    query {
      whoami {
        public {
          profile {
            id
            preferredName
            avatarImage {
              uri
            }
          }
        }
        personal {
          profile {
            ...ProfileFragment
          }
        }
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export const getProfile = id => ({
  query: gql`
    ${PROFILE_FRAGMENT}
    query($id: String!) {
      person(id: $id){
        ...ProfileFragment
        children {
          profile {
            ...ProfileFragment
          }
          linkId
          relationshipType
          legallyAdopted
        }
        parents {
          profile {
            ...ProfileFragment
          }
          linkId
          relationshipType
          legallyAdopted
        }
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

// get person with parents and children from DB
export async function getRelatives (profileId) {
  const request = getProfile(profileId)
  const result = await apolloClient.query(request)
  if (result.errors) {
    console.error('WARNING, something went wrong')
    console.error(result.errors)
  } else {
    return result.data.person
  }
}

export const saveProfile = input => {
  input = pick(input, PERMITTED_PROFILE_ATTRS)
  return {
    mutation: gql`
      mutation($input: ProfileInput!) {
        saveProfile(input: $input)
      }
    `,
    variables: { input }
  }
}

export const saveCurrentIdentity = (personalId, publicId, input) => {
  const personalDetails = pick(input, PERMITTED_PROFILE_ATTRS)
  const publicDetails = pick(input, PERMITTED_PUBLIC_PROFILE_ATTRS)

  return {
    mutation: gql`
      mutation ($personalDetails:ProfileInput, $publicDetails:ProfileInput) {
        savePersonalProfile: saveProfile(input:$personalDetails)
        savePublicProfile: saveProfile(input:$publicDetails)
      }
    `,
    variables: {
      personalDetails: {
        id: personalId,
        ...personalDetails
      },
      publicDetails: {
        id: publicId,
        ...publicDetails,
        allowPublic: true
      }
    }
  }
}
