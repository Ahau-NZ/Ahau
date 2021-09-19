import gql from 'graphql-tag'
import { COMMUNITY_FRAGMENT } from '../../../lib/community-helpers'

export const createSubGroup = (parentGroupId) => {
  return {
    mutation: gql`
      mutation($id: String!) {
        createSubGroup(id: $id) {
          id
          poBoxId
        }
      }
    `,
    variables: {
      id: parentGroupId
    }
  }
}

export const getSubGroups = (parentGroupId) => {
  return {
    query: gql`
      ${COMMUNITY_FRAGMENT}
      query($id: String!) {
        subtribes(id: $id) {
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
    variables: {
      id: parentGroupId
    },
    fetchPolicy: 'no-cache'
  }
}
