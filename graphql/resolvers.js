const { GraphQLUpload } = require('graphql-upload')
const GraphQLDate = require('graphql-date')
const ssbResolvers = require('./ssb')

module.exports = function Resolvers (sbot) {
  const {
    getProfile,
    getWhakapapaView,
    getWhakapapaViews,
    getCloseWhakapapa,
    getPersons,
    getCommunities,
    getTiaki,
    postUploadFile,
    postSaveProfile,
    postSaveWhakapapaRelation,
    postSaveWhakapapaView,
    streamPeers
  } = ssbResolvers(sbot)

  return {
    Query: {
      whoami: async (_, __, { feedId, profileId }) => {
        const profile = await getProfile(profileId)
        return {
          id: feedId,
          feedId,
          profile
        }
      },
      persons: async () => getPersons(),
      communities: () => getCommunities(),
      person: (_, { id }) => getProfile(id),
      whakapapaView: (_, { id }) => getWhakapapaView(id),
      whakapapaViews: () => getWhakapapaViews()
    },
    Person: {
      canEdit: (profile, _, { feedId }) => profile.authors.includes(feedId), // WIP
      parents: profile => getCloseWhakapapa(profile.id, 'parents'),
      children: profile => getCloseWhakapapa(profile.id, 'children')
    },
    // WhakapapaLink: {
    //   profile: (obj) => obj.id,
    //   children:
    // },
    Community: {
      tiaki: obj => getTiaki(obj.authors)
    },

    Mutation: {
      uploadFile: (_, { file }) => postUploadFile(file),
      saveProfile: (_, { input }) => postSaveProfile(input),
      // TODO align naming across stack : link / relation / child
      saveWhakapapaRelation: (_, { input }) => postSaveWhakapapaRelation(input),
      saveWhakapapaView: (_, { input }) => postSaveWhakapapaView(input)
    },
    Subscription: {
      peers: {
        subscribe: () => streamPeers()
      }
    },
    Upload: GraphQLUpload,
    Date: GraphQLDate
  }
}
