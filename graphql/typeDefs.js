const { gql } = require('apollo-server')

// TODO change defs of altNames

module.exports = gql`
  type CurrentIdentity {
    id: String
    feedId: String
    profileId: String

    profile: Profile
  }

  input ImageInput {
    blob: String
    mimeType: String
    size: Int
    width: Int
    height: Int
    uri: String
  }

  type Image {
    blob: String
    mimeType: String
    size: Int
    width: Int
    height: Int
    uri: String
  }

  enum Gender {
    male
    female
    other
  }

  type Blob {
    blob: String
    mimeType: String
    size: Int
    uri: String
  }

  type Profile {
    id: String
    type: String
    authors: [String]
    canEdit: Boolean

    preferredName: String
    legalName: String
    altNames: [String]
    description: String
    avatarImage: Image
    headerImage: Image

    gender: Gender

    tiaki: [Profile]
  }

  input UpdateProfileInput {
    id: String!
    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: ImageInput
    headerImage: ImageInput
    description: String
    gender: Gender
  }
  input CreateProfileInput {
    type: String!

    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: ImageInput
    headerImage: ImageInput
    description: String
    gender: Gender
  }

  input CommunityInput {
    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: ImageInput
    headerImage: ImageInput
    description: String
  }

  type Peer {
    id: String
    state: String
  }

  type Query {
    "Scuttlebutt Who am I"
    whoami: CurrentIdentity

    "List of person profiles"
    persons: [Profile]
    "List of community profiles"
    communities: [Profile]

    "Scuttlebutt identity profile"
    profile(id: String!): Profile
  }

  type Mutation {
    createProfile(input: CreateProfileInput): String
    updateProfile(input: UpdateProfileInput): String
    uploadFile(file: Upload!): Blob
  }

  type Subscription {
    peers: [Peer]
  }
`
