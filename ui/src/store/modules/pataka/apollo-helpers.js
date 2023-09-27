import gql from 'graphql-tag'

export const getPatakas = (opts = {}) => ({
  query: gql`
    query {
      patakas {
        id
        feedId
        preferredName
        avatarImage { uri }
        description
        isBlocked
      }
    }
  `,
  ...opts
})

export const blockPataka = (id) => ({
  mutation: gql`
    mutation ($id: String!) {
      blockPataka(feedId: $id)
    }
  `,
  variables: { id }
})

export const unblockPataka = (id) => ({
  mutation: gql`
    mutation ($id: String!) {
      unblockPataka(feedId: $id)
    }
  `,
  variables: { id }
})
