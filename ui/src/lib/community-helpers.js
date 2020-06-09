import gql from 'graphql-tag'
import {
  createProvider
} from '@/plugins/vue-apollo'

const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

export const PERMITTED_COMMUNITY_ATTRS = [
  'id',
  'type',
  'preferredName',
  'legalName',
  'altNames',
  'description',
  'avatarImage',
  'headerImage',
  'tombstone',
  'email',
  'phone',
  'address',
  'location'
]

// TODO: finish community-helper
// eg: getCommunity() *single community

export const saveCommunityProfile = input => ({
  mutation: gql`
      mutation($input: ProfileInput!) {
        saveProfile(input: $input)
      }
    `,
  variables: {
    input
  }
})

export default async function saveCommunity (input) {
  console.log('input:', input)
  const request = saveCommunityProfile(input)
  console.log('request:', request)
  const result = await apolloClient.mutate(request)
  console.log('result:', result)
  if (result.errors) {
    console.error('WARNING, something went wrong')
    console.error(result.errors)
  } else {
    return result.data
  }
}

export const getCommunities = () => ({
  query: gql`
      query {
        communities {
          id
          preferredName 
          legalName
          description 
          avatarImage { uri } 
          headerImage { uri }
          tombstone
        }
      }
    `,
  // variables: {
  //   id: id
  // },
  fetchPolicy: 'no-cache'
})
