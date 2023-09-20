import gql from 'graphql-tag'
import { pick } from 'lodash-es'

import { COMMUNITY_FRAGMENT } from '../../../lib/community-helpers'
import { PublicProfileFieldsFragment } from '../profile/apollo-helpers'

export const PERMITTED_COMMUNITY_LINK_ATTRS = [
  'id',
  'profile',
  'group',
  'parentGroupId',
  'allowPublic'
]

export const getTribe = ({
  query: gql`
    ${COMMUNITY_FRAGMENT}
    query($id: String!) {
      tribe (id: $id){
        id 
        public {
          ...CommunityFragment
        }
        private {
          ...CommunityFragment

          # settings
          allowWhakapapaViews
          allowStories
          allowPersonsList
        }
        admin {
          id
        }
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

export const getTribes = ({
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

          # settings
          allowWhakapapaViews
          allowStories
          allowPersonsList
        }
        admin {
          id
        }
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

const communityProfileAttrs = [
  'preferredName',
  'description',

  'avatarImage',
  'headerImage',

  'address',
  'city',
  'country',
  'postCode',
  'phone',
  'email',

  // for private only
  'allowWhakapapaViews',
  'allowStories',
  'allowPersonsList',

  // for public only
  'joiningQuestions',
  'customFields'
]

export const initGroup = (_input) => {
  const input = pick(_input, communityProfileAttrs)

  if (input.avatarImage) delete input.avatarImage.uri
  if (input.headerImage) delete input.headerImage.uri

  return {
    mutation: gql`
      mutation ($communityProfile: CommunityProfileInput!) {
        initGroup(communityProfile: $communityProfile) {
          groupId
          adminSubGroupId
          poBoxId
        }
      }
    `,
    variables: {
      communityProfile: input
    }
  }
}

export const addAdminsToGroup = (groupId, adminIds) => {
  return {
    mutation: gql`
      mutation ($groupId: String!, $adminIds: [String!]!) {
        addAdminsToGroup(groupId: $groupId, adminIds: $adminIds)
      }
    `,
    variables: {
      groupId,
      adminIds
    }
  }
}

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
