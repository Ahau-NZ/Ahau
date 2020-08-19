import gql from 'graphql-tag'
import pick from 'lodash.pick'
import { PUBLIC_PROFILE_FRAGMENT } from '@/lib/person-helpers'
import { createProvider } from '@/plugins/vue-apollo'

const apolloProvider = createProvider()
const apolloClient = apolloProvider.defaultClient

export const PERMITTED_COMMUNITY_ATTRS = [
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
      mutation($privateInput:ProfileInput, $publicInput:ProfileInput) {
        deletePrivate: saveProfile(input:$privateInput)
        deletePublic: saveProfile(input:$publicInput)
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
      mutation($privateInput:ProfileInput, $publicInput:ProfileInput) {
        savePrivate: saveProfile(input:$privateInput)
        savePublic: saveProfile(input:$publicInput)
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

export const getTribes = ({
  query: gql`
  ${PUBLIC_PROFILE_FRAGMENT}
  query {
    tribes {
      id
      public {
        id
        preferredName
        description
        avatarImage { uri } 
        description
        headerImage { uri }
        tombstone { date }
        tiaki {
          ...PublicProfileFragment
        }
      }
      private {
        id
        preferredName
        description
        avatarImage { uri }
        headerImage { uri }
        recps
        tombstone {date}
        tiaki {
          ...PublicProfileFragment
        }
      }
    }
  }
`,
  fetchPolicy: 'no-cache'
})

function prune (input, attrs) {
  const _input = pick(input, attrs)
  Object.entries(_input).forEach(([key, value]) => {
    if (value === '') {
      delete _input[key]
    }
  })
  return _input
}

export const getCommunityProfile = id => ({
  query: gql`
    ${PUBLIC_PROFILE_FRAGMENT}
    query($id: String!) {
      community {
        id
        preferredName
        description
        avatarImage { uri } 
        description
        headerImage { uri }
        tombstone { date }
        tiaki {
          ...PublicProfileFragment
        }
      }
    }
  `,
  variables: { id: id },
  fetchPolicy: 'no-cache'
})

// TODO: figure out how to manage query in vue vs in js
// should this file export mutations or results
export async function callGetTribe (profileId) {
  const result = await apolloClient.query(getTribes)
  if (result.errors) {
    console.error('Failed to to get Tribes')
    console.error(result.errors)
  } else {
    const tribes = result.data.tribes.filter(tribe => tribe.private.length > 0)
    const tribe = tribes.find(tribe => tribe.private[0].id === profileId)
    return tribe
  }
}