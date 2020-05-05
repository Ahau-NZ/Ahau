import gql from 'graphql-tag'

/*
  Query for loading details about a person, plus minimal details about their parents + children
*/
export const person = id => ({
  query: gql`
    query($id: String!) {
      person(id: $id) {
        id
        preferredName
        legalName
        gender
        bornAt
        diedAt
        birthOrder
        description
        address
        email
        phone
        location
        profession
        deceased
        altNames
        avatarImage {
          uri
        }
        children {
          profile {
            id
          }
          relationshipId
          relationshipType
          legallyAdopted
        }
        parents {
          profile {
            id
          }
          relationshipId
          relationshipType
          legallyAdopted
        }
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

/*
  db mutation to save a profile - for create, update and delete
*/
export const savePerson = input => ({
  mutation: gql`
    mutation($input: ProfileInput!) {
      saveProfile(input: $input)
    }
  `,
  variables: {
    input: input
  }
})
