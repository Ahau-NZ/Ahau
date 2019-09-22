const { gql } = require('apollo-server')

const Query = gql`
  type Query {
    whoami: String
  }
`

const Mutation = gql`
  type Mutation {
    publish(input: String): String
  }
`

const Schema = () => [
  `
  schema {
    query: Query
  }
`
]

module.exports = [Schema, Query]
