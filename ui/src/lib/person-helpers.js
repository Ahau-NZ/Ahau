import gql from 'graphql-tag'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'
import { PublicProfileFieldsFragment, saveProfile } from './profile-helpers'

export function setPersonProfile (input) {
  var profile = clone(input)

  return {
    id: profile.id,
    gender: profile.gender,
    legalName: profile.legalName,
    aliveInterval: profile.aliveInterval,
    preferredName: profile.preferredName,
    avatarImage: profile.avatarImage,
    description: profile.description,
    birthOrder: profile.birthOrder,
    email: profile.email,
    phone: profile.phone,
    deceased: profile.deceased,
    address: profile.address,
    city: profile.city,
    country: profile.country,
    postCode: profile.postCode,
    profession: profile.profession,
    placeOfBirth: profile.placeOfBirth,
    placeOfDeath: profile.placeOfDeath,
    buriedLocation: profile.buriedLocation,

    // relationship
    relationshipType: profile.relationshipType,
    altNames: {
      currentState: clone(profile.altNames),
      add: [], // new altNames to add
      remove: [] // altNames to remove
    },
    education: profile.education || [],
    school: profile.school || []
  }
}

export const PERMITTED_PERSON_PROPS = [
  'id',
  'canEdit',
  'type',

  'preferredName',
  'legalName',
  'altNames',
  'description',
  'gender',

  'postCode',
  'city',
  'country',
  'profession',

  'aliveInterval',
  'birthOrder',
  'deceased',

  'placeOfBirth',
  'placeOfDeath',
  'buriedLocation',

  'education',
  'school',

  'recps',

  'address',
  'email',
  'phone'
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
  fragment AvatarFragment on Image {
    blob
    mimeType
    size
    width
    height
    uri
  }
  fragment ProfileFragment on Person {
    ${PERMITTED_PERSON_PROPS}
    avatarImage { ...AvatarFragment }
    headerImage { ...AvatarFragment }
  }
`
export const SETTINGS_FRAGMENT = gql`
  ${AUTHOR_FRAGMENT}
  fragment SettingsFragment on Settings {
    id
    keyBackedUp
    tombstone {
      date
      reason
    }
    recps
    authors {
      ...AuthorFragment
      profile {
        type
        ...ProfileFragment
      }
    }
    tiaki {
      type
      ...ProfileFragment
    }
    canEdit
    originalAuthor
  }
`

export const whoami = ({
  query: gql`
    ${PublicProfileFieldsFragment}
    ${PERSON_FRAGMENT}
    ${AUTHOR_FRAGMENT}
    ${SETTINGS_FRAGMENT}
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
            avatarImage {
              uri
              blob
              mimeType
              size
              width
              height
            }
            headerImage {
              uri
              blob
              mimeType
              size
              width
              height
            }
            ...on Person {
              tiaki {
                ...PublicProfileFields
              }
            }
            authors {
              ...AuthorFragment
              profile {
                ...ProfileFragment
              }
            }
          }
          settings {
            ...SettingsFragment
          }
        }
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export const WHAKAPAPA_LINK_FRAGMENT = gql`
  fragment WhakapapaLinkFragment on Person {
    relationshipType
    legallyAdopted
  }
`

const GET_PERSON = gql`
  ${PublicProfileFieldsFragment}
  ${PERSON_FRAGMENT}
  ${AUTHOR_FRAGMENT}
  ${WHAKAPAPA_LINK_FRAGMENT}
  query($id: String!) {
    person(id: $id){
      ...ProfileFragment
      children {
        ...ProfileFragment
        ...WhakapapaLinkFragment
      }
      parents {
        ...ProfileFragment
        ...WhakapapaLinkFragment
        partners {
          ...ProfileFragment
        }
      }
      partners {
        ...ProfileFragment
        children {
          ...ProfileFragment
          ...WhakapapaLinkFragment
        }
        parents {
          ...ProfileFragment
          ...WhakapapaLinkFragment
        }
      }
      siblings {
        ...ProfileFragment
        parents {
          ...ProfileFragment
          ...WhakapapaLinkFragment
        }
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
      originalAuthor
      adminProfile {
        ...ProfileFragment
      }
    }
  }
`

export const getPerson = id => ({
  query: GET_PERSON,
  variables: { id },
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

export function pruneEmptyValues (input) {
  const pruned = {}
  Object.entries(input).forEach(([key, value]) => {
    if (Array.isArray(value) && !value.length) return
    if (typeof value === 'object' && value === {}) return
    if (value !== null) pruned[key] = value
  })
  return pruned
}

export function getDisplayName (profile) {
  if (!profile || (!profile.preferredName && !profile.legalName)) return 'Unknown'
  if (profile.preferredName === '' && profile.legalName === '') return 'Unknown'

  return profile.preferredName || profile.legalName.split(' ')[0]
}

export const whakapapaLink = (parent, child, isPartner) => ({
  query: gql`
    query($parent: String!, $child: String!, $isPartner: Boolean) {
      whakapapaLink (parent: $parent, child: $child, isPartner: $isPartner) {
        type
        linkId
        parent
        child
        relationshipType
        legallyAdopted
        recps
      }
    }
  `,
  variables: {
    parent,
    child,
    isPartner
  }
})

export function setDefaultData (withRelationships) {
  const formData = {
    type: 'person',
    id: '',
    preferredName: '',
    legalName: '',
    altNames: {
      add: []
    },
    gender: '',
    relationshipType: 'birth',
    legallyAdopted: false,
    children: [],
    avatarImage: {},
    aliveInterval: '',
    birthOrder: '',
    description: '',
    city: '',
    country: '',
    postCode: '',
    profession: '',
    address: '',
    email: '',
    phone: '',
    deceased: false,
    placeOfBirth: '',
    placeOfDeath: '',
    buriedLocation: '',
    education: [],
    school: []
  }

  if (!withRelationships) {
    delete formData.relationshipType
    delete formData.legallyAdopted
  }

  return formData
}
