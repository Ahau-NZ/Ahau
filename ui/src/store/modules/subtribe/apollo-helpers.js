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

export const deleteSubGroup = (profileInSubGroup, profileInGroup) => {
  return {
    mutation: gql`
      mutation($profileInSubGroup: CommunityProfileInput!, $profileInGroup: CommunityProfileInput!) {
        deleteProfileInSubGroup: saveCommunity(input: $profileInSubGroup)
        deleteProfileInGroup: saveCommunity(input: $profileInGroup)
      }
    `,
    variables: {
      profileInSubGroup: {
        id: profileInSubGroup.id,
        tombstone: { date: new Date() }
      },
      profileInGroup: {
        id: profileInGroup.id,
        tombstone: { date: new Date() }
      }
    }
  }
}
