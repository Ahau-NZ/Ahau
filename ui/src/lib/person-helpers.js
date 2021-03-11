import gql from 'graphql-tag'
import pick from 'lodash.pick'
import { PublicProfileFieldsFragment, saveProfile } from './profile-helpers'

export const PERMITTED_PERSON_PROPS = [
  'id',
  'canEdit',
  'type',

  'preferredName',
  'legalName',
  'altNames',
  'description',
  'gender',

  'address',
  'email',
  'phone',
  'profession',

  'aliveInterval',
  'birthOrder',
  'deceased',

  'placeOfBirth',
  'placeOfDeath',
  'buriedLocation',

  'recps'
]

export const PERMITTED_PERSON_NESTED_PROPS = [
  'headerImage',
  'avatarImage',
  'tombstone',
  'authors'
]

export const PERMITTED_PERSON_ATTRS = [
  ...PERMITTED_PERSON_NESTED_PROPS,
  ...PERMITTED_PERSON_PROPS
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

export const AUTHOR_FRAGMENT = gql`
  fragment AuthorFragment on Author {
    feedId
    intervals {
      start
      end
    }
  }
`

export const PERSON_FRAGMENT = gql`
  fragment ProfileFragment on Person {
    ${PERMITTED_PERSON_PROPS}
    avatarImage { uri }
    headerImage { uri }
  }
`

export const whoami = ({
  query: gql`
    ${PublicProfileFieldsFragment}
    ${PERSON_FRAGMENT}
    ${AUTHOR_FRAGMENT}
    query {
      whoami {
        public {
          feedId
          profile {
            type
            ...ProfileFragment
          }
        }
        personal {
          groupId
          profile {
            ...ProfileFragment
            tiaki {
              ...PublicProfileFields
            }
            authors {
              ...AuthorFragment
              profile {
                ...ProfileFragment
              }
            }
          }
        }
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export const PROFILE_LINK_FRAGMENT = gql`
  fragment ProfileLinkFragment on WhakapapaLink {
    linkId
    relationshipType
    legallyAdopted
  }
`

export const getPerson = id => ({
  query: gql`
    ${PublicProfileFieldsFragment}
    ${PERSON_FRAGMENT}
    ${AUTHOR_FRAGMENT}
    ${PROFILE_LINK_FRAGMENT}
    query($id: String!) {
      person(id: $id){
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
        tiaki {
          ...PublicProfileFields
        }
        authors {
          ...AuthorFragment
          profile {
            ...ProfileFragment
          }
        }
      }
    }
  `,
  variables: {
    id
  },
  update: data => data.person,
  fetchPolicy: 'no-cache'
})

// get person with parents and children from DB
export async function getRelatives (profileId, apollo) {
  apollo = apollo || this.$apollo
  try {
    const request = getPerson(profileId)
    const result = await apollo.query(request)
    if (result.errors) {
      console.error('WARNING, something went wrong')
      console.error(result.errors)
    } else {
      return result.data.person
    }
  } catch (e) {
    console.error('WARNING, something went wrong, caught it')
    console.error(e)
  }
}

export const savePerson = input => {
  input = pick(input, PERMITTED_PERSON_ATTRS)
  input = pruneEmptyValues(input)

  return saveProfile(input)
}

function pruneEmptyValues (input) {
  const pruned = {}
  Object.entries(input).forEach(([key, value]) => {
    if (value !== null) pruned[key] = value
  })
  return pruned
}

export function getDisplayName (profile) {
  if (!profile || (!profile.preferredName && !profile.legalName)) return 'Unknown'
  if (profile.preferredName === '' && profile.legalName === '') return 'Unknown'

  return profile.preferredName || profile.legalName.split(' ')[0]
}
