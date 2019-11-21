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
  }
  input CreateProfileInput {
    type: String!

    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: ImageInput
    headerImage: ImageInput
    description: String
  }

  input CommunityInput {
    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: ImageInput
    headerImage: ImageInput
    description: String
  }

  input CreateWhakapapaInput {
    child: String!
    parent: String!
    relationshipType: RelationshipType
    legallyAdopted: Boolean
    recps: [String]
  }

  enum RelationshipType {
    birth
    adopted
    whangai
    unknown
  }

  type Peer {
    id: String
    state: String
  }

  type WhakapapaNode {
    profileId: String
    relationshipType: RelationshipType
    legallyAdopted: Boolean
  }

  type Whakapapa {
    profileId: String
    parents: [WhakapapaNode]
    children: [WhakapapaNode]
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

    "Scuttlebutt parent and child relations to a profile"
    whakapapa(id: String!): Whakapapa
  }

  type Mutation {
    createProfile(input: CreateProfileInput): String
    updateProfile(input: UpdateProfileInput): String
    uploadFile(file: Upload!): Blob
    createWhakapapaRelation(input: CreateWhakapapaInput): String
  }

  type Subscription {
    peers: [Peer]
  }
`
