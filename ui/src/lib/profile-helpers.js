import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'

const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

export const PERMITTED_PROFILE_ATTRS = [
  // WARNING: make sure header and avatar images are the first two
  'headerImage',
  'avatarImage',
  'id',
  'type',
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
  'deceased'
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

export const getwhoami = ({
  query: gql`
    ${PROFILE_FRAGMENT}
    query {
      whoami {
        profile {
          ...ProfileFragment
        }
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export const GET_PROFILE = id => ({
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
export default async function getRelatives (profileId) {
  const request = GET_PROFILE(profileId)
  const result = await apolloClient.query(request)
  if (result.errors) {
    console.error('WARNING, something went wrong')
    console.error(result.errors)
  } else {
    return result.data.person
  }
}

export const saveProfile = input => ({
  mutation: gql`
    mutation($input: ProfileInput!) {
      saveProfile(input: $input)
    }
  `,
  variables: { input }
})
