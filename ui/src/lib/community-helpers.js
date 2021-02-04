import gql from 'graphql-tag'
import pick from 'lodash.pick'
import clone from 'lodash.clonedeep'

import { PUBLIC_PROFILE_FRAGMENT, AUTHOR_FRAGMENT } from './person-helpers'

export const EMPTY_COMMUNITY = {
  type: 'community',
  id: null,
  preferredName: null,
  avatarImage: null,
  headerImage: null,
  description: null,
  location: null,
  address: null,
  email: null,
  phone: null
}

export function setDefaultCommunity (newCommunity) {
  var community = clone(newCommunity)

  return {
    id: community.id,
    preferredName: community.preferredName,
    avatarImage: community.avatarImage,
    headerImage: community.headerImage,
    description: community.description,
    location: community.location,
    address: community.address,
    email: community.email,
    phone: community.phone
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
  'location',
  'tombstone',
  'tiaki',
  // private only attrs
  'address',
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
  'location',
  'tombstone',
  'tiaki'
]

export const PERMITTED_COMMUNITY_LINK_ATTRS = [
  'id',
  'profile',
  'group',
  'allowPublic'
]

// TODO: finish community-helper
// eg: getCommunity() *single community
export const getMembers = id => ({
  query: gql`
    ${PUBLIC_PROFILE_FRAGMENT}
    query($id: ID!) {
      listGroupAuthors(id: $id) {
        ...PublicProfileFragment
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

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
  const publicDetails = pick(input, PERMITTED_PUBLIC_COMMUNITY_ATTRS)

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
    ${AUTHOR_FRAGMENT}
    ${PUBLIC_PROFILE_FRAGMENT}
    query {
      tribes {
        id
        public {
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
          location
          tiaki {
            ...PublicProfileFragment
          }
          authors {
            ...AuthorFragment
            profile {
              ...PublicProfileFragment
            }
          }
        }
        private {
          id
          type
          preferredName
          description
          avatarImage { uri }
          headerImage { uri }
          email
          phone
          location
          canEdit
          recps
          tiaki {
            ...PublicProfileFragment
          }
          authors {
            ...AuthorFragment
            profile {
              ...PublicProfileFragment
            }
          }
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

export const getCommunity = id => ({
  query: gql`
    ${PUBLIC_PROFILE_FRAGMENT}
    query($id: String!) {
      community {
        id
        preferredName
        description
        avatarImage {
          uri
        }
        description
        headerImage {
          uri
        }
        tombstone {
          date
        }
        tiaki {
          ...PublicProfileFragment
        }
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

export const getTribe = ({
  query: gql`
    ${PUBLIC_PROFILE_FRAGMENT}
    query($id: String!) {
      tribe (id: $id){
        id 
        private {
          id
          preferredName
          description
          avatarImage {
            uri
          }
          description
          headerImage {
            uri
          }
          tombstone {
            date
          }
          tiaki {
            ...PublicProfileFragment
          }
        }
        public {
          id
          preferredName
          description
          avatarImage {
            uri
          }
          description
          headerImage {
            uri
          }
          tombstone {
            date
          }
          tiaki {
            ...PublicProfileFragment
          }
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
