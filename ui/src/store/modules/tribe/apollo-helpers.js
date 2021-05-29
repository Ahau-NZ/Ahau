import gql from 'graphql-tag'

export const getTribeIds = {
  query: gql`
    query {
      listGroups {
        id
      }
    }
  `
}
