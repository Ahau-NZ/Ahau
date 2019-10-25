const { PubSub } = require('apollo-server')
const { isMsg, isFeed } = require('ssb-ref')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const { GraphQLUpload } = require('graphql-upload')
const toUrl = require('ssb-serve-blobs/id-to-url')

const getProfiles = require('./ssb/profiles')
const getCommunities = require('./ssb/communities')

const pubsub = new PubSub()

module.exports = sbot => ({
  Query: {
    whoami: (_, __, { feedId, profileId }) =>
      new Promise(resolve => resolve({ id: feedId, feedId, profileId })),

    persons: () =>
      new Promise((resolve, reject) => {
        getProfiles(sbot, (err, profiles) => {
          if (err) reject(err)
          else resolve(profiles)
        })
      }),

    communities: () =>
      new Promise((resolve, reject) => {
        getCommunities(sbot, (err, profiles) => {
          if (err) reject(err)
          else resolve(profiles)
        })
      }),

    profile: (_, { id }, { feedId, profileId }) =>
      new Promise((resolve, reject) => {
        if (!isMsg(id)) {
          reject(new Error('profile query expected %msgId, got ' + id))
        }

        sbot.profile.get(id, (err, profile) => {
          if (err) return reject(err)

          // <<< WIP
          const { state } = profile.states[0] // WARNING! we're assuming just one head-state!
          var canEdit = false
          if (id === profileId) canEdit = true
          if (state.type === 'community') canEdit = true
          // TODO to change profile.get to return "authors" so can check if I canEdit?
          // >>>

          resolve({
            id,
            canEdit,

            ...state
          })
        })

        // TODO Deprecate?
        // else if (isFeed(id)) {
        //   // if it's a @feedId, try looking up the associated profile
        //   sbot.profile.findByFeedId(id, (err, profile) => {
        //     if (err) return reject(err)

        //     if (profile) {
        //       const { state } = profile.states[0] // WARNING! we're assuming just one head-state!
        //       resolve({ id: profile.key, ...state })
        //     } else {
        //       reject(new Error('no profile set up for id:' + id))
        //     }
        //   })
        // }
      })
  },

  Mutation: {
    async uploadFile (_, { file }) {
      const { createReadStream, filename, mimetype, encoding } = await file
      console.log('!!!! INCOMING FILE !!!!!!', filename, mimetype, encoding)

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
        const id = input.id

        let update = {}
        Object.keys(input).forEach(i => {
          if (i === 'id') return
          if (i === 'altNames') {
            // update[i] = {
            //   add: input[i]
            // }
          } else {
            update[i] = { set: input[i] }
          }
        })
        console.log(update)
        sbot.profile.update(id, update, (err, updateMsg) => {
          if (err) throw err
          const id = input.id

          let update = {}
          Object.keys(input).forEach(i => {
            if (i === 'id') return
            if (i === 'avatarImage') {
              console.log('IMAGE FILE', input[i])
              return
            }
            if (i === 'altNames') {
              // update[i] = {
              //   add: input[i]
              // }
            } else {
              update[i] = { set: input[i] }
            }
          })

          sbot.profile.update(id, update, (err, updateMsg) => {
            if (err) throw err
            const T = buildTransformation(input)
            sbot.profile.update(input.id, T, (err, updateMsg) => {
              if (err) reject(err)
              else resolve(input.id)
            })
          })
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

      case 'alt':
        // TODO
        return

      case 'avatarImage':
        // TODO
        return

      default:
        T[key] = { set: value }
    }
  })

  return T
}
