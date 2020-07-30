import gql from 'graphql-tag'
import pick from 'lodash.pick'
// import {
//   createProvider
// } from '@/plugins/vue-apollo'

// const apolloProvider = createProvider()
// const apolloClient = apolloProvider.defaultClient

export const PERMITTED_COMMUNITY_ATTRS = [
  'id',
  'type',

  'preferredName',
  // 'legalName',
  // 'altNames',

  'description',
  'avatarImage',
  'headerImage',

  'email',
  'phone',
  'address',
  'location',

  'tombstone',
  'recps'
]

export const PERMITTED_PUBLIC_COMMUNITY_ATTRS = [
  'id',
  'preferredName',
  'avatarImage',
  'description',
  'headerImage',
  'email',
  'phone',
  'location',
  'tombstone'
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
  const _input = pick(input, PERMITTED_COMMUNITY_ATTRS)
  Object.entries(_input).forEach(([key, value]) => {
    if (value === '') {
      delete _input[key]
    }
  })
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
// make savePublicCommunity
export const savePublicCommunity = input => {
  const _input = pick(input, PERMITTED_PUBLIC_COMMUNITY_ATTRS)
  Object.entries(_input).forEach(([key, value]) => {
    if (value === '') {
      delete _input[key]
    }
  })
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
  const _input = pick(input, PERMITTED_COMMUNITY_LINK_ATTRS)
  Object.entries(_input).forEach(([key, value]) => {
    if (value === '') {
      delete _input[key]
    }
  })

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

// export async function saveCommunity (input) {
//   console.log('input:', input)
//   const request = saveCommunityProfile(input)
//   console.log('request:', request)
//   const result = await apolloClient.mutate(request)
//   console.log('result:', result)
//   if (result.errors) {
//     console.error('WARNING, something went wrong')
//     console.error(result.errors)
//   } else {
//     return result.data
//   }
// }

// export const getCommunities = () => ({
//   query: gql`
//     query {
//       communities {
//         id
//         preferredName
//         legalName
//         description
//         avatarImage { uri }
//         headerImage { uri }
//         tombstone // <<< currently a problem
//       }
//     }
//   `,
//   // variables: {
//   //   id: id
//   // },
//   fetchPolicy: 'no-cache'
// })
