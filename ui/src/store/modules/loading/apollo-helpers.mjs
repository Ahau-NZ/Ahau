import gql from 'graphql-tag'

export const getIndexes = {
  query: gql`
    query {
      indexes {
        isIndexing
        isRebuilding
        percentageIndexed
        percentageIndexedSinceStartup
      }
    }
  `,
  fetchPolicy: 'no-cache'
}
