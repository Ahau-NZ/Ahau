import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'

const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

export async function findByName (name) {
  const request = {
    query: gql`
      query($name: String!) {
        findPersons(name: $name) {
          id
          preferredName
          legalName
          gender
          bornAt
          diedAt
          birthOrder
          description
          altNames
          avatarImage { uri }
          children {
            profile {
              id
              preferredName
              legalName
              gender
              bornAt
              diedAt
              birthOrder
              description
              altNames
              avatarImage { uri }
            }
            relationshipType
          }
          parents {
            profile {
              id
              preferredName
              legalName
              gender
              bornAt
              diedAt
              birthOrder
              description
              altNames
              avatarImage { uri }
            }
            relationshipType
          }
        }
      }
    `,
    variables: {
      name: name
    },
    fetchPolicy: 'no-cache'
  }

  try {
    const result = await apolloClient.query(request)
    if (result.errors) {
      console.error('WARNING, something went wrong')
      console.error(result.errors)
      return
    }
    return result.data.findPersons
  } catch (e) {
    console.error('WARNING, something went wrong, caught it')
    console.error(e)
  }
}