import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'

const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

export const PERMITTED_PROFILE_ATTRS = [
  'type',
  'gender',
  'legalName',
  'aliveInterval',
  'preferredName',
  'avatarImage',
  'description',
  'headerImage',
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

export const whoami = ({
  query: gql`
    {
      whoami {
        profile {
          id
        }
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export const getProfile = id => ({
  query: gql`
    query($id: String!) {
      person(id: $id){
        id type
        preferredName legalName altNames
        aliveInterval birthOrder
        gender description 
        location  address email
        phone profession deceased
        avatarImage { uri } headerImage { uri }
        children {
          profile {
            id
            preferredName legalName altNames
            aliveInterval birthOrder
            gender description
            location  address deceased
            email phone profession
            avatarImage { uri }
          }
          relationshipId
          relationshipType
        }
        parents {
          profile {
            id
            preferredName legalName altNames
            aliveInterval birthOrder
            gender description
            location address email
            phone profession deceased
            avatarImage { uri }
          }
          relationshipId
          relationshipType
        }
        
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

// get person with parents and children from DB
export default async function getRelatives (profileId) {
  const request = getProfile(profileId)
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

async function getPataka () {
  const result = await apolloClient.query({
    query: gql`
      query{
        patakas {
          id preferredName avatarImage {uri} description
        }
      }`,
    fetchPolicy: 'no-cache'
  })
  if (result.errors) {
    console.error('WARNING, something went wrong getting patakas')
    console.error(result.errors)
  } else {
    return result.data.patakas
  }
  return result
}

async function getConnectedPeers () {
  const result = await apolloClient.query({
    query: gql`
    {
      connectedPeers {
        pataka {
          id
          preferredName
          avatarImage {uri}
        }
      }
    }
  `,
    fetchPolicy: 'no-cache'
  })
  if (result.errors) {
    console.error('WARNING, something went wrong getting connected peers')
    console.error(result.errors)
  } else {
    return result.data.connectedPeers
  }
  return result
}

export async function getSortedPatakas () {
  const patakas = await getPataka()
  const connectedPeers = await getConnectedPeers()

  const sortedPatakas = patakas.map(pataka => {
    if (connectedPeers.pataka.some(peer => peer.id === pataka.id)) {
      return {
        ...pataka,
        online: true
      }
    } else return pataka
  })
  return sortedPatakas
}
