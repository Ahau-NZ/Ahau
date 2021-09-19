import gql from 'graphql-tag'
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
