const { gql } = require('apollo-server')

// TODO change defs of altNames

module.exports = gql`
  type CurrentIdentity {
    id: String
    feedId: String
    profileId: String
  }

  type Profile {
    id: String
    type: String
    canEdit: Boolean

    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: String
    headerImage: String
    description: String
  }

  input CreateProfileInput {
    type: String!

    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: String
    headerImage: String
    description: String
  }
  input UpdateProfileInput {
    id: String!

    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: String
    headerImage: String
    description: String
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

  type Query {
    "Scuttlebutt Who am I"
    whoami: CurrentIdentity

    "Scuttlebutt identity profile"
    profile(id: String!): Profile

    "List human profiles"
    profiles: [Profile]

    "Scuttlebutt community"
    communities: [Community]
  }

  type Mutation {
    createProfile(input: CreateProfileInput): String
    updateProfile(input: UpdateProfileInput): String
    uploadFile(file: Upload!): String
  }

  type Subscription {
    peers: [Peer]
  }
`
