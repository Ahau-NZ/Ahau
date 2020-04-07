import gql from 'graphql-tag'

export const PERMITTED_PROFILE_ATTRS = [
  'gender',
  'legalName',
  'bornAt',
  'diedAt',
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
        id
        preferredName legalName altNames
        bornAt diedAt birthOrder
        gender description 
        location  address email
        phone profession deceased
        avatarImage { uri }
        children {
          profile {
            id
            preferredName legalName altNames
            bornAt diedAt birthOrder
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
            bornAt diedAt birthOrder
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

export const saveProfile = input => ({
  mutation: gql`
    mutation($input: ProfileInput!) {
      saveProfile(input: $input)
    }
  `,
  variables: { input }
})
