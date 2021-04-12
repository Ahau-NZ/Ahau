import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import { PERSON_FRAGMENT, PROFILE_LINK_FRAGMENT } from './person-helpers.js'

const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

export async function findByName (name) {
  const request = {
    query: gql`
      ${PERSON_FRAGMENT}
      ${PROFILE_LINK_FRAGMENT}
      query($name: String!) {
        findPersons(name: $name) {
          ...ProfileFragment
          children {
            profile {
              ...ProfileFragment
            }
            ...ProfileLinkFragment
          }
          parents {
            profile {
              ...ProfileFragment
            }
            ...ProfileLinkFragment
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
