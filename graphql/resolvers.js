const { PubSub } = require('apollo-server')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const { GraphQLUpload } = require('graphql-upload')
const toUrl = require('ssb-serve-blobs/id-to-url')
const get = require('lodash.get')
const pick = require('lodash.pick')
const blobToURI = require('ssb-serve-blobs/id-to-url')

const getProfiles = require('./ssb/profiles')
const getProfile = require('./ssb/profile')
const getCommunities = require('./ssb/communities')

const pubsub = new PubSub()

module.exports = sbot => ({
  Query: {
    whoami: (_, __, { feedId, profileId }) =>
      new Promise((resolve, reject) => {
        getProfile(sbot, profileId, (err, profile) => {
          if (err) return reject(err)

          resolve({
            id: feedId,
            feedId,
            profile: addURIs(profile)
          })
        })
      }),

    persons: () =>
      new Promise((resolve, reject) => {
        getProfiles(sbot, (err, profiles) => {
          if (err) reject(err)
          else resolve(profiles.map(addURIs))
        })
      }),

    communities: () =>
      new Promise((resolve, reject) => {
        getCommunities(sbot, (err, profiles) => {
          if (err) reject(err)
          else resolve(profiles.map(addURIs))
        })
      }),

    profile: (_, { id }, { feedId, profileId }) =>
      new Promise((resolve, reject) => {
        getProfile(sbot, id, (err, profile) => {
          if (err) return reject(err)

          resolve({
            id,
            canEdit: profile.tiaki === feedId, // WIP
            ...addURIs(profile)
          })
        })
      })
  },

  Mutation: {
    async uploadFile (_, { file }) {
      const { createReadStream, filename, mimetype } = await file

      return new Promise((resolve, reject) => {
        pull(
          toPull.source(createReadStream()),
          sbot.blobs.add((err, hash) => {
            if (err) return reject(err)
            resolve({
              blob: hash,
              mimeType: mimetype,
              uri: toUrl(hash)
              // TODO size:
            })
          })
        )
      })
    },

    createProfile: (_, { input }) => {
      const T = buildTransformation(input)
      return new Promise((resolve, reject) => {
        sbot.profile.create(input.type, T, (err, profileId) => {
          if (err) reject(err)
          else resolve(profileId)
        })
      })
    },

    updateProfile: (_, { input }) =>
      // TODO check permissions?
      new Promise((resolve, reject) => {
        const update = buildTransformation(input)
        sbot.profile.update(input.id, update, (err, updateMsg) => {
          if (err) reject(err)
          else resolve(input.id)
        })
      })
  },
  Subscription: {
    peers: {
      subscribe: () => {
        pull(
          sbot.conn.peers(),
          pull.drain(
            data => {
              const formated = data.map(p => ({
                id: p[1].key,
                state: p[1].state
              }))
              return pubsub.publish('peer', formated)
            },
            err => {
              throw err
            }
          )
        )
        return pubsub.asyncIterator(['peer'])
      }
    }
  },
  Upload: GraphQLUpload
})

function buildTransformation (input) {
  let T = {}

  Object.entries(input).forEach(([key, value]) => {
    switch (key) {
      case 'type':
        return
      case 'id':
        return

      case 'altNames':
        // TODO
        return

      case 'avatarImage':
        T[key] = { set: pick(value, ['blob', 'mimeType', 'size', 'width', 'height']) }
        return
      case 'headerImage':
        T[key] = { set: pick(value, ['blob', 'mimeType', 'size', 'width', 'height']) }
        return

      default:
        T[key] = { set: value }
    }
  })

  return T
}

function addURIs (state) {
  if (get(state, 'avatarImage.blob')) {
    state.avatarImage.uri = blobToURI(state.avatarImage.blob)
  }

  if (get(state, 'headerImage.blob')) {
    state.headerImage.uri = blobToURI(state.headerImage.blob)
  }

  return state
}