const { gql } = require('apollo-server')

const Query = gql`
  input ProfileInput {
    firstName: String
    lastName: String
    names: [String]
    bio: String
    preferredName: String
    coverPhoto: String
    avatarPhoto: String
  }
  type Profile {
    firstName: String
    lastName: String
    names: [String]
    bio: String
    preferredName: String
    coverPhoto: String
    avatarPhoto: String
  }
  type Query {
    whoami: String
    profile: Profile
  }
`

const Mutation = gql`
  type Mutation {
    saveProfile(input: ProfileInput): String
  }
`

const Schema = () => [
  `
  schema {
    query: Query
    mutation: Mutation
  }
`
]

module.exports = [Schema, Query, Mutation]
