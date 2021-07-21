import gql from 'graphql-tag'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'

// disabled until returning empty authors is fixed
// import { AUTHOR_FRAGMENT } from './person-helpers'
import { PublicProfileFieldsFragment } from './profile-helpers.js'

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
  joiningQuestions: [],
  authors: [],
  kaitiaki: []
}

export function setDefaultCommunity (newCommunity) {
  var community = clone(newCommunity)

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
    joiningQuestions: community.joiningQuestions,
    authors: community.kaitiaki.map(d => ({ ...d.profile, feedId: d.feedId }))
  }
}

export const EMPTY_SUBGROUP = {
  type: 'subgroup',
  id: null,
  preferredName: null,
  avatarImage: null,
  description: null,
  authors: [],
  kaitiaki: [],
  members: []
}

export function setDefaultSubgroup (newSubgroup) {
  var subGroup = clone(newSubgroup)

  return {
    id: subGroup.id,
    preferredName: subGroup.preferredName,
    avatarImage: subGroup.avatarImage,
    description: subGroup.description,
    authors: subGroup.kaitiaki.map(d => ({ ...d.profile, feedId: d.feedId })),
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
  'recps'
]

export const PERMITTED_PUBLIC_COMMUNITY_ATTRS = [
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
  'joiningQuestions'
]

export const PERMITTED_COMMUNITY_LINK_ATTRS = [
  'id',
  'profile',
  'group',
  'allowPublic'
]

export const getMembers = id => ({
  query: gql`
    ${PublicProfileFieldsFragment}
    query($id: ID!) {
      listGroupAuthors(id: $id) {
        ...PublicProfileFields
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

export const COMMUNITY_FRAGMENT = gql`
${PublicProfileFieldsFragment}
  fragment CommunityFragment on Community {
    id
    type
    preferredName
    description
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
    joiningQuestions {
      type
      label
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

export const createGroup = () => {
  return {
    mutation: gql`
      mutation($nothing: Boolean) {
        createGroup(nothing: $nothing) {
          id
        }
      }
    `,
    variables: { nothing: true }
  }
}

export const saveCommunity = input => {
  const _input = prune(input, PERMITTED_COMMUNITY_ATTRS)

  if (!_input.id) _input.type = 'community'
  if (_input.avatarImage) delete _input.avatarImage.uri
  if (_input.headerImage) delete _input.headerImage.uri

  return {
    mutation: gql`
      mutation($input: ProfileInput!) {
        saveProfile(input: $input)
      }
    `,
    variables: {
      input: _input
    }
  }
}

export const savePublicCommunity = input => {
  const _input = prune(input, PERMITTED_PUBLIC_COMMUNITY_ATTRS)

  if (!_input.id) _input.type = 'community'
  if (_input.avatarImage) delete _input.avatarImage.uri
  if (_input.headerImage) delete _input.headerImage.uri

  _input.allowPublic = true

  return {
    mutation: gql`
      mutation($input: ProfileInput!) {
        saveProfile(input: $input)
      }
    `,
    variables: {
      input: _input
    }
  }
}

export const saveGroupProfileLink = input => {
  const _input = prune(input, PERMITTED_COMMUNITY_LINK_ATTRS)

  return {
    mutation: gql`
      mutation($input: GroupProfileLinkInput!) {
        saveGroupProfileLink(input: $input)
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
      mutation($privateInput: ProfileInput, $publicInput: ProfileInput) {
        deletePrivate: saveProfile(input: $privateInput)
        deletePublic: saveProfile(input: $publicInput)
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
      mutation($privateInput: ProfileInput, $publicInput: ProfileInput) {
        savePrivate: saveProfile(input: $privateInput)
        savePublic: saveProfile(input: $publicInput)
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

export const getTribes = {
  query: gql`
    ${COMMUNITY_FRAGMENT}
    query {
      tribes {
        id
        public {
          ...CommunityFragment
        }
        private {
          ...CommunityFragment
        }
      }
    }
  `,
  fetchPolicy: 'no-cache'
}

function prune (input, attrs) {
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

export const getTribe = ({
  query: gql`
    ${COMMUNITY_FRAGMENT}
    query($id: String!) {
      tribe (id: $id){
        id 
        private {
          ...CommunityFragment
        }
        public {
          ...CommunityFragment
        }
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
