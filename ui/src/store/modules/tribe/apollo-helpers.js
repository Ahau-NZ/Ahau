import gql from 'graphql-tag'
import { prune } from '@/lib/community-helpers.js'

export const PERMITTED_COMMUNITY_LINK_ATTRS = [
  'id',
  'profile',
  'group',
  'allowPublic'
]

export const getTribeIds = {
  query: gql`
    query {
      listGroups {
        id
      }
    }
  `
}

export const createGroup = {
  mutation: gql`
    mutation {
      createGroup {
        id
      }
    }
  `
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

// export const createSubgroup = (groupId) => {
//   return {
//     mutation: gql`
//       mutation($id: String!) {
//         createSubgroup(id: $id) {
//           id
//           root
//           # dmKey # TODO
//         }
//       }
//     `,
//     variables: {
//       id: groupId
//     }
//   }
// }
