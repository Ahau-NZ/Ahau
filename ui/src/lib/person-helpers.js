import gql from 'graphql-tag'
import { createProvider } from '@/plugins/vue-apollo'
import pick from 'lodash.pick'

const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

export const PERMITTED_PERSON_ATTRS = [
  'headerImage',
  'avatarImage',
  'tombstone',
  // WARNING: make sure header and avatar images are the first two and tombstone is the third (for PERSON_FRAGMENT)

  'canEdit',
  'id',
  // NOTE: we don't allow setting of `type`, this is always "profile"
  'preferredName',
  'legalName',
  'altNames',
  'description',
  'gender',

  'address',
  'location',
  'email',
  'phone',
  'profession',

  'aliveInterval',
  'birthOrder',
  'deceased',
  'type',

  'recps'
]

export const PERMITTED_PUBLIC_PERSON_ATTRS = [
  'id',
  'preferredName',
  'avatarImage',
  'gender'
]

export const PERMITTED_RELATIONSHIP_ATTRS = [
  'relationshipType',
  'legallyAdopted'
]

export const PERSON_FRAGMENT = gql`
  fragment ProfileFragment on Person {
    ${PERMITTED_PERSON_ATTRS.slice(3)}
    avatarImage { uri }
    headerImage { uri }
  }
`
export const PUBLIC_PROFILE_FRAGMENT = gql`
  fragment PublicProfileFragment on Person {
    id
    preferredName
    avatarImage { uri }
  }
`

export const AUTHOR_FRAGMENT = gql`
  fragment AuthorFragment on Author {
    feedId
    interval {
      start
      end
    }
  }
`
export const whoami = ({
  query: gql`
    ${PERSON_FRAGMENT}
    ${PUBLIC_PROFILE_FRAGMENT}
    ${AUTHOR_FRAGMENT}
    query {
      whoami {
        public {
          feedId
          profile {
            type
            ...PublicProfileFragment
          }
        }
        personal {
          groupId
          profile {
            ...ProfileFragment
            authors {
              ...AuthorFragment
              profile {
                ...PublicProfileFragment
              }
            }
          }
        }
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export const getPerson = id => ({
  query: gql`
    ${PERSON_FRAGMENT}
    ${AUTHOR_FRAGMENT}
    ${PUBLIC_PROFILE_FRAGMENT}
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
        authors {
          ...AuthorFragment
          profile {
            ...PublicProfileFragment
          }
        }
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

// get person with parents and children from DB
export async function getRelatives (profileId) {
  const request = getPerson(profileId)
  const result = await apolloClient.query(request)
  if (result.errors) {
    console.error('WARNING, something went wrong')
    console.error(result.errors)
  } else {
    return result.data.person
  }
}

export const savePerson = input => {
  var _input = pick(input, PERMITTED_PERSON_ATTRS)
  _input = pruneEmptyValues(_input)

  if (!_input.id) _input.type = 'person'

  return {
    mutation: gql`
      mutation($input: ProfileInput!) {
        saveProfile(input: $input)
      }
    `,
    variables: { input: _input }
  }
}

function pruneEmptyValues (input) {
  const pruned = {}
  Object.entries(input).forEach(([key, value]) => {
    if (value !== '' && value !== null) pruned[key] = value
  })
  return pruned
}
