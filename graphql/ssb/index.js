const run = require('promisify-tuple')
const { PubSub } = require('apollo-server')

const pubsub = new PubSub()

const GetProfile = require('./queries/get-profile')
const GetPersons = require('./queries/get-persons')
const GetWhakapapaView = require('./queries/get-whakapapa-view')
const GetWhakapapaViews = require('./queries/get-whakapapa-views')
const GetCloseWhakapapa = require('./queries/get-close-whakapapa')
const GetCommunities = require('./queries/get-communities')
const GetTiaki = require('./queries/get-tiaki')

const PostUploadFile = require('./mutations/post-upload-file')
const PostSaveProfile = require('./mutations/post-save-profile')
const PostSaveWhakapapaRelation = require('./mutations/post-save-whakapapa-link')
const PostSaveWhakapapaView = require('./mutations/post-save-whakapapa-view')
const StreamPeers = require('./subscriptions/stream-peers')

function p (fn) {
  return async function () {
    const [err, result] = await run(fn)(...arguments)

    if (err) throw err
    else return result
  }
}

module.exports = function (sbot) {
  const getProfile = GetProfile(sbot)
  const getWhakapapaView = GetWhakapapaView(sbot)

  const getPersons = GetPersons(sbot, getProfile)
  const getCommunities = GetCommunities(sbot, getProfile)
  const getTiaki = GetTiaki(sbot)
  const getCloseWhakapapa = GetCloseWhakapapa(sbot, getProfile)

  const getWhakapapaViews = GetWhakapapaViews(sbot, getWhakapapaView)

  const postUploadFile = PostUploadFile(sbot)
  const postSaveProfile = PostSaveProfile(sbot)
  const postSaveWhakapapaRelation = PostSaveWhakapapaRelation(sbot)
  const postSaveWhakapapaView = PostSaveWhakapapaView(sbot)

  const streamPeers = StreamPeers(sbot, pubsub)

  return {
    getProfile: p(getProfile),
    getPersons: p(getPersons),
    getWhakapapaView: p(getWhakapapaView),
    getWhakapapaViews: p(getWhakapapaViews),
    getCloseWhakapapa: p(getCloseWhakapapa),
    getCommunities: p(getCommunities),
    getTiaki: p(getTiaki),
    postUploadFile: p(postUploadFile),
    postSaveProfile: p(postSaveProfile),
    postSaveWhakapapaRelation: p(postSaveWhakapapaRelation),
    postSaveWhakapapaView: p(postSaveWhakapapaView),
    streamPeers: p(streamPeers)
  }
}
