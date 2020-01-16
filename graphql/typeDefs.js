const { gql } = require('apollo-server')

// TODO change defs of altNames

module.exports = gql`
  scalar Date

  """
  Secure Scuttlebutt current identity
  """
  type CurrentIdentity {
    id: ID!
    feedId: String
    profile: Person
  }

  input ImageInput {
    blob: String
    mimeType: String
    size: Int
    width: Int
    height: Int
    uri: String
  }

  """
  Fields used by ssb-profiles plugin for an image
  """
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
    unknown
  }

  type Tombstone {
    date: Date
    reason: String
  }

  input TombstoneInput {
    date: Date
    reason: String
  }

  """
  Secure Scuttlebutt's binary file
  """
  type Blob {
    blob: String
    mimeType: String
    size: Int
    uri: String
  }

  """
  Fields used by ssb-profiles plugin for a person's profile
  """
  type Person {
    id: ID!
    type: String
    preferredName: String
    legalName: String
    altNames: [String]
    description: String
    avatarImage: Image
    headerImage: Image
    tombstone: Tombstone
    canEdit: Boolean

    gender: Gender
    children: [WhakapapaLink]
    parents: [WhakapapaLink]
  }

  """
  Fields used by ssb-profiles plugin for a communities's profile
  """
  type Community {
    id: ID!
    type: String
    preferredName: String
    legalName: String
    altNames: [String]
    description: String
    avatarImage: Image
    headerImage: Image
    tombstone: Tombstone
    canEdit: Boolean

    tiaki: [Person]
  }

  input ProfileInput {
    id: String
    type: String

    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: ImageInput
    headerImage: ImageInput
    description: String
    gender: Gender
    recps: [String]
    tombstone: TombstoneInput
  }

  input CommunityInput {
    preferredName: String
    legalName: String
    altNames: [String]
    avatarImage: ImageInput
    headerImage: ImageInput
    description: String
    recps: [String]
  }

  input WhakapapaRelationInput {
    relationshipId: String
    child: String
    parent: String
    relationshipType: RelationshipType
    legallyAdopted: Boolean
    recps: [String]
  }

  input WhakapapaViewInput {
    viewId: String
    name: String
    description: String
    focus: String
    mode: Mode
    recps: [String]
  }

  enum Mode {
    descendants
    ancestors
  }

  enum RelationshipType {
    birth
    adopted
    whangai
    unknown
  }

  """
  Secure Scuttlebutt's peer
  """
  type Peer {
    id: String
    state: String
  }

  """
  Whakapapa link between two persons
  """
  type WhakapapaLink {
    profile: Person
    relationshipType: RelationshipType
    legallyAdopted: Boolean
  }

  """
  Whakapapa view entry with a focus on a Person and private, visible only to recps
  """
  type WhakapapaView {
    id: ID
    name: String
    description: String
    focus: ID
    mode: Mode
    recps: [String]
  }

  type Query {
    """
    Returns information about the default Person associated with this SSB identity
    """
    whoami: CurrentIdentity

    """
    Get every message of type profile/person and present a list of Persons
    """
    persons: [Person]

    """
    Returns information about the profile/person associated with the Person of given id
    """
    person(id: String!): Person

    """
    Get every message of type profile/community and present a list of Communities
    """
    communities: [Community]

    """
    Return a list whakapapa/view records without duplicates
    """
    whakapapaViews: [WhakapapaView]

    """
    Return information about the whakapapa/view record with given id
    """
    whakapapaView(id: String!): WhakapapaView
  }

  type Mutation {
    """
    Create or update an community or person profile
    """
    saveProfile(input: ProfileInput): String
    """
    Upload a file to the Secure Scuttlebutt network
    """
    uploadFile(file: Upload!): Blob
    """
    Create or update a Whakapapa relation link entry
    """
    saveWhakapapaRelation(input: WhakapapaRelationInput): String
    """
    Create or update a Whakapapa view entry
    """
    saveWhakapapaView(input: WhakapapaViewInput): String
  }

  type Subscription {
    """
    Return information about the Secure Scuttlebutt peers
    """
    peers: [Peer]
  }
`
