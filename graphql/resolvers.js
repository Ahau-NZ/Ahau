const { PubSub } = require('apollo-server')
const { isMsg, isFeed } = require('ssb-ref')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const { GraphQLUpload } = require('graphql-upload')

const getProfiles = require('./ssb/profiles')

const pubsub = new PubSub()

module.exports = sbot => ({
  Query: {
    whoami: (_, __, { feedId, profileId }) =>
      new Promise(resolve =>
        resolve({ id: feedId, feedId, profileId })
      ),

    profiles: () =>
      new Promise((resolve, reject) => {
        getProfiles(sbot, (err, profiles) => {
          if (err) reject(err)
          else resolve(profiles)
        })
      }),

    profile: (_, { id }, context) =>
      new Promise((resolve, reject) => {
        if (isMsg(id)) {
          // if it's a %messageId, look it up
          sbot.profile.get(id, (err, profile) => {
            if (err) return reject(err)

            const { state } = profile.states[0] // WARNING! we're assuming just one head-state!
            resolve({ id, ...state })
          })
        } else if (isFeed(id)) {
          // if it's a @feedId, try looking up the associated profile
          sbot.profile.findByFeedId(id, (err, profile) => {
            if (err) return reject(err)

            if (profile) {
              const { state } = profile.states[0] // WARNING! we're assuming just one head-state!
              resolve({ id: profile.key, ...state })
            } else {
              reject(new Error('no profile set up for id:' + id))
            }
          })
        }
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
            resolve(hash)
          })
        )
      })
    },

    createProfile: (_, { input }) => {
      let details = {}
      Object.entries(input).forEach(([ key, value ]) => {
        switch (key) {
          case 'type': return

          case 'alt':
            // TODO
            return

          default:
            details[key] = { set: value }
        }
      })

      console.log(input.type, JSON.stringify(details, null, 2))

      return new Promise((resolve, reject) => {
        sbot.profile.create(input.type, details, (err, profileId) => {
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
          if (err) reject(err)
          else resolve(id)
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
