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

// export const PERMITTED_PROFILE_ATTRS = [
//   'gender',
//   'legalName',
//   'bornAt',
//   'diedAt',
//   'preferredName',
//   'avatarImage',
//   'description',
//   'headerImage',
//   'altNames',
//   'birthOrder',
//   'location',
//   'email',
//   'phone',
//   'address',
//   'profession',
//   'deceased'
// ]

// export const PERMITTED_RELATIONSHIP_ATTRS = [
//   'relationshipType',
//   'legallyAdopted'
// ]

// const getProfile = id => ({
//   query: gql`
//     query($id: String!) {
//       person(id: $id){
//         id
//         preferredName legalName altNames
//         bornAt diedAt birthOrder
//         gender description
//         location  address email
//         phone profession deceased
//         avatarImage { uri }
//         children {
//           profile {
//             id
//             preferredName legalName altNames
//             bornAt diedAt birthOrder
//             gender description
//             location  address deceased
//             email phone profession
//             avatarImage { uri }
//           }
//           relationshipId
//           relationshipType
//         }
//         parents {
//           profile {
//             id
//             preferredName legalName altNames
//             bornAt diedAt birthOrder
//             gender description
//             location address email
//             phone profession deceased
//             avatarImage { uri }
//           }
//           relationshipId
//           relationshipType
//         }

//       }
//     }
//   `,
//   variables: { id: id },
//   fetchPolicy: 'no-cache'
// })

// const saveProfile = input => ({
//   mutation: gql`
//     mutation($input: ProfileInput!) {
//       saveProfile(input: $input)
//     }
//   `,
//   variables: { input }
// })

// export default {
//   getProfile,
//   saveProfile,
//   getRelatives
// }
