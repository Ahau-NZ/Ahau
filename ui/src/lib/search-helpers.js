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
          type
          preferredName
          legalName
          gender
          aliveInterval
          birthOrder
          description
          altNames
          avatarImage { uri }
          recps
          children {
            profile {
              id
              type
              preferredName
              legalName
              gender
              aliveInterval
              birthOrder
              description
              altNames
              avatarImage { uri }
              recps
            }
            relationshipType
          }
          parents {
            profile {
              id
              type
              preferredName
              legalName
              gender
              aliveInterval
              birthOrder
              description
              altNames
              avatarImage { uri }
              recps
            }
            relationshipType
          }
        }
      }
    `,
    variables: {
      name
    },
    fetchPolicy: 'no-cache'
  }

  try {
    const res = await apolloClient.query(request)
    if (res.errors) throw res.errors
    return res.data.findPersons
  } catch (err) {
    console.error('something went wrong while trying to find persons by name', err)
  }
}
