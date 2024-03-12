import gql from 'graphql-tag'
import { pick, cloneDeep as clone } from 'lodash-es'

// disabled until returning empty authors is fixed
// import { AUTHOR_FRAGMENT } from './person-helpers'
import { PublicProfileFieldsFragment } from '../store/modules/profile/apollo-helpers.mjs'

export function mergeTribeProfiles (tribe) {
  if (!tribe.public) return tribe.private[0]

  const profile = tribe.private[0]

  for (const [key, value] of Object.entries(tribe.public[0])) {
    if (key === 'id') continue
    if (isEmpty(value)) continue
    if (key === '__typename') continue

    // over-ride!
    profile[key] = value
  }

  if (!profile.customFields) profile.customFields = [] // for tribes, some custom fields may be null

  return profile
}

export const EMPTY_COMMUNITY = {
  type: 'community',
  id: null,
  preferredName: null,
  avatarImage: null,
  headerImage: null,
  description: null,
  address: null,
  city: null,
  country: null,
  postCode: null,
  email: null,
  phone: null,

  authors: [],
  kaitiaki: [],

  // private community settings
  allowWhakapapaViews: true,
  allowStories: true,
  allowPersonsList: true,

  // public community settings
  issuesVerifiedCredentials: false,
  acceptsVerifiedCredentials: false,
  joiningQuestions: [],
  customFields: []
}

export function setDefaultCommunity (newCommunity) {
  const community = clone(newCommunity)

  return {
    id: community.id,
    preferredName: community.preferredName,
    avatarImage: community.avatarImage,
    headerImage: community.headerImage,
    description: community.description,
    address: community.address,
    city: community.city,
    country: community.country,
    postCode: community.postCode,
    email: community.email,
    phone: community.phone,
    authors: (community.kaitiaki || community.tiaki).map(d => ({ ...d.profile, feedId: d.feedId })),

    // private community settings
    allowWhakapapaViews: community.allowWhakapapaViews,
    allowStories: community.allowStories,
    allowPersonsList: community.allowPersonsList,

    // public community settings
    joiningQuestions: community.joiningQuestions,
    issuesVerifiedCredentials: community.issuesVerifiedCredentials,
    acceptsVerifiedCredentials: community.acceptsVerifiedCredentials,
    customFields: community.customFields || []
  }
}
// TODO: uncomment needed fields
export const EMPTY_SUBGROUP = {
  // type: 'subgroup',
  id: null,
  preferredName: null,
  avatarImage: null,
  description: null,
  authors: [],
  kaitiaki: [],
  members: []
}

export function setDefaultSubgroup (newSubgroup) {
  const subGroup = clone(newSubgroup)

  return {
    id: subGroup.id,
    preferredName: subGroup.preferredName,
    avatarImage: subGroup.avatarImage,
    description: subGroup.description,
    authors: (subGroup.kaitiaki || subGroup.tiaki).map(d => ({ ...d.profile, feedId: d.feedId })),
    members: subGroup.members
  }
}

export const PERMITTED_COMMUNITY_ATTRS = [
  'authors',
  'avatarImage',
  'headerImage',
  'id',
  'type',
  'preferredName',
  'description',
  'email',
  'phone',
  'address',
  'city',
  'country',
  'postCode',
  'tombstone',
  'tiaki',
  // private only attrs
  'recps',

  // private community settings
  'allowWhakapapaViews',
  'allowStories',
  'allowPersonsList',

  'poBoxId'
]

export const PERMITTED_PUBLIC_COMMUNITY_ATTRS = [
  'authors',
  'avatarImage',
  'headerImage',
  'id',
  'poBoxId',
  'type',
  'preferredName',
  'description',
  'email',
  'phone',
  'address',
  'city',
  'country',
  'postCode',
  'tombstone',
  'tiaki',
  'joiningQuestions',
  'customFields',
  'issuesVerifiedCredentials',
  'acceptsVerifiedCredentials'
]

export const COMMUNITY_FRAGMENT = gql`
${PublicProfileFieldsFragment}
  fragment CommunityFragment on Community {
    id
    type
    preferredName
    description
    poBoxId
    avatarImage { uri }
    headerImage { uri }
    email
    phone
    canEdit
    recps
    address
    city
    country
    postCode
    kaitiaki {
      feedId
      profile {
        ...PublicProfileFields
      }
    }

    # only on public profiles
    joiningQuestions {
      type
      label
    }
    customFields {
      key
      label
      type
      required
      visibleBy
      order
      ...on CommunityCustomFieldList {
        multiple
        options
      }
      tombstone {
        date
      }
    }

  }
`
// copied until returning empty author is fixed
// export const COMMUNITY_FRAGMENT = gql`
// ${PublicProfileFieldsFragment}
// ${AUTHOR_FRAGMENT}
//   fragment CommunityFragment on Community {
//     id
//     type
//     preferredName
//     description
//     avatarImage { uri }
//     headerImage { uri }
//     email
//     phone
//     canEdit
//     recps
//     address
//     city
//     country
//     postCode
//     kaitiaki {
//       feedId
//       profile {
//         ...PublicProfileFields
//       }
//     }
//     joiningQuestions {
//       type
//       label
//     }
//     authors {
//       ...AuthorFragment
//       profile {
//         ...PublicProfileFields
//       }
//     }
//   }
// `

export const saveCommunity = input => {
  const _input = prune(input, PERMITTED_COMMUNITY_ATTRS)

  if (_input.avatarImage) delete _input.avatarImage.uri
  if (_input.headerImage) delete _input.headerImage.uri

  return {
    mutation: gql`
      mutation($input: CommunityProfileInput!) {
        saveCommunity(input: $input)
      }
    `,
    variables: {
      input: _input
    }
  }
}

export const savePublicCommunity = input => {
  const _input = prune(input, PERMITTED_PUBLIC_COMMUNITY_ATTRS)

  if (_input.avatarImage) delete _input.avatarImage.uri
  if (_input.headerImage) delete _input.headerImage.uri

  _input.allowPublic = true

  return {
    mutation: gql`
      mutation($input: CommunityProfileInput!) {
        saveCommunity(input: $input)
      }
    `,
    variables: {
      input: _input
    }
  }
}

export const deleteTribe = tribe => {
  return {
    mutation: gql`
      mutation($privateInput: CommunityProfileInput!, $publicInput: CommunityProfileInput!) {
        deletePrivate: saveCommunity(input: $privateInput)
        deletePublic: saveCommunity(input: $publicInput)
      }
    `,
    variables: {
      privateInput: {
        id: tribe.private[0].id,
        tombstone: { date: new Date() }
      },
      publicInput: {
        id: tribe.public[0].id,
        tombstone: { date: new Date() },
        allowPublic: true
      }
    }
  }
}

export const updateTribe = (tribe, input) => {
  const privateDetails = pick(input, PERMITTED_COMMUNITY_ATTRS)
  if (privateDetails.avatarImage) delete privateDetails.avatarImage.uri
  if (privateDetails.headerImage) delete privateDetails.headerImage.uri

  const publicDetails = pick(input, PERMITTED_PUBLIC_COMMUNITY_ATTRS)
  if (publicDetails.avatarImage) delete privateDetails.avatarImage.uri
  if (publicDetails.headerImage) delete privateDetails.headerImage.uri

  return {
    mutation: gql`
      mutation($privateInput: CommunityProfileInput!, $publicInput: CommunityProfileInput!) {
        savePrivate: saveCommunity(input: $privateInput)
        savePublic: saveCommunity(input: $publicInput)
      }
    `,
    variables: {
      privateInput: {
        id: tribe.private[0].id,
        ...privateDetails
      },
      publicInput: {
        id: tribe.public[0].id,
        ...publicDetails,
        allowPublic: true
      }
    }
  }
}

export function prune (input, attrs) {
  const _input = pick(input, attrs)
  Object.entries(_input).forEach(([key, value]) => {
    if (value === '') {
      delete _input[key]
    }
  })
  return _input
}

export const getCommunity = ({
  query: gql`
    ${COMMUNITY_FRAGMENT}
    query($id: String!) {
      community(id: $id) {
        ...CommunityFragment
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export function getTribalProfile (tribe, whoami) {
  // see if this is our own personal tribe
  if (whoami.personal.groupId === tribe.groupId || whoami.personal.groupId === tribe.id) {
    return {
      groupId: whoami.personal.groupId,
      ...whoami.personal.profile,
      isPersonalGroup: true
    }
  }

  // not our personal tribe
  return {
    groupId: tribe.id,
    ...tribe.private.length > 0
      ? tribe.private[0]
      : tribe.public[0],
    isPersonalGroup: false
  }
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
