import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import { PERSON_FRAGMENT, WHAKAPAPA_LINK_FRAGMENT } from './person-helpers.js'

const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

const QUERY = gql`
  ${PERSON_FRAGMENT}
  ${WHAKAPAPA_LINK_FRAGMENT}
  query($name: String!, $groupId: String, $type: String) {
    findPersons(name: $name, groupId: $groupId, type: $type) {
      ...ProfileFragment
      children {
        ...ProfileFragment
        ...WhakapapaLinkFragment
      }
      parents {
        ...ProfileFragment
        ...WhakapapaLinkFragment
      }
      partners {
        ...ProfileFragment
        ...WhakapapaLinkFragment
      }
    }
  }
`
export async function findByName (name, opts = {}) {
  const { groupId, type } = opts
  const request = {
    query: QUERY,
    variables: {
      name,
      type,
      groupId // optional - can be groupId or poBoxId
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
