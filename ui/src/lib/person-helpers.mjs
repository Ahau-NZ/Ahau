import gql from 'graphql-tag'
import { cloneDeep as clone } from 'lodash-es'
import { PublicProfileFieldsFragment } from '../store/modules/profile/apollo-helpers.mjs'

export function setPersonProfile (input) {
  const profile = clone(input)

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
    customFields: profile.customFields || {},

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
  'authors',
  'customFields'
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
    customFields { key value }
    originalAuthor
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
        linkedProfileIds
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

export function getDisplayName (profile) {
  if (!profile || Object.keys(profile).length === 0) return ''

  if (!profile.preferredName && !profile.legalName) return 'Unknown'
  if (profile.preferredName === '' && profile.legalName === '') return 'Unknown'

  return profile.preferredName || profile.legalName.split(' ')[0]
}

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
    school: [],
    customFields: []
  }

  if (!withRelationships) {
    delete formData.relationshipType
    delete formData.legallyAdopted
  }

  return formData
}

export function mergeAdminProfile (profile) {
  if (!profile) return {}
  if (!profile.adminProfile) return profile

  const adminProfile = clone(profile.adminProfile)
  profile.adminProfile = null // faster than delete

  for (const key in adminProfile) {
    if (key === 'id') continue
    if (isEmpty(adminProfile[key])) continue
    if (key === 'customFields') {
      // go through all the custom fields on the adminProfile and merge them with the values on the group profile
      adminProfile.customFields.forEach((customField) => {
        const { key: _key, value: _value } = customField
        // check if the field is on the group profile
        const index = profile.customFields.findIndex(field => field.key === _key)
        if (index > -1) {
          // if it is, then we check if the adminProfiles value
          if (!isEmpty(_value)) {
            // if it isnt empty, we want to replace the value on the group profile
            profile.customFields[index] = customField
          }
        } else {
          // otherwise, if its not on the group profile, just add it
          profile.customFields.push(customField)
        }
      })
      continue
    }

    // over-ride!
    profile[key] = adminProfile[key]
  }

  return profile
}

function isEmpty (value) {
  if (value == null) return true
  if (value === '') return true
  if (Array.isArray(value)) {
    if (value.length === 0) return true
    if (value.every(el => el === '')) return true
  }

  return false
}
