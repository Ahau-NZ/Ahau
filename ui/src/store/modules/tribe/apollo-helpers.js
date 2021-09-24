import gql from 'graphql-tag'
import pick from 'lodash.pick'

import { prune, COMMUNITY_FRAGMENT } from '../../../lib/community-helpers'

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
      }
    }
  `,
  fetchPolicy: 'no-cache'
})

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
        initGroup(communityProfile: $communityProfile)
      }
    `,
    variables: {
      communityProfile: input
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
