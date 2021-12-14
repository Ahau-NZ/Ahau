import gql from 'graphql-tag'
import pick from 'lodash.pick'

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
        private {
          ...CommunityFragment
        }
        public {
          ...CommunityFragment
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

  // for public only
  'joiningQuestions'
]

export const initGroup = (_input) => {
  const input = pick(_input, communityProfileAttrs)
  return {
    mutation: gql`
      mutation ($communityProfile: CommunityProfileInput) {
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
