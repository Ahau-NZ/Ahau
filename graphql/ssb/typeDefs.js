const { gql } = require('apollo-server')

module.exports = gql`
  input UpdateProfileInput {
    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: String
    headerImage: String
    description: String
    id: String!
  }
  input CreateProfileInput {
    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: String
    headerImage: String
    description: String
    type: String!
  }
  input CommunityInput {
    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: String
    headerImage: String
    description: String
  }
  type Community {
    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: String
    headerImage: String
    description: String
  }
  type Peer {
    id: String
    state: String
  }
  type Profile {
    id: String
    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: String
    headerImage: String
    description: String
    type: String
  }
  type Query {
    "Scuttlebutt Who am I"
    whoami: String
    "Scuttlebutt identity profile"
    profile(id: String!): Profile
    "Scuttlebutt community"
    communities: [Community]
    "List human profiles"
    profiles: [Profile]
  }
  type Mutation {
    createProfile(input: CreateProfileInput): String
    updateProfile(input: UpdateProfileInput): String
  }
  type Subscription {
    peers: [Peer]
  }
`
