const { PubSub } = require('apollo-server')
const { isMsg, isFeed } = require('ssb-ref')
const pull = require('pull-stream')
const pullParamap = require('pull-paramap')
const isProfile = require('ssb-profile/lib/is-profile')

const pubsub = new PubSub()

module.exports = sbot => ({
  Query: {
    whoami: () => new Promise((resolve, reject) => {
      sbot.whoami((err, info) => {
        if (err) {
          reject(err)
        }
        resolve(info.id)
      })
    }),

    profiles: () => new Promise((resolve, reject) => {
      const query = [
        {
          $filter: {
            timestamp: { $gt: 0 }, // forces order by received time
            value: {
              // timestamp: { $gt: 0 }, // forces order by asserted publish time
              content: {
                type: 'profile/person', // for example
                tangles: {
                  profile: { root: null, previous: null }
                }
              }
            }
          }
        }
      ]

      pull(
        sbot.query.read({ query }),
        pull.filter(isProfile),
        pullParamap(
          (root, cb) => sbot.profile.get(root.key, (err, profile) => {
            if (err) cb(null, null)
            else {
              const { state } = profile.states[0] // WARNING! we're assuming just one head-state!
              cb(null, { id: root.key, ...state })
            }
          }),
          6 // "width" i.e. how many to simultaneously run in parallel
        ),
        pull.filter(Boolean), // drop profiles which has some trouble resolving
        pull.collect((err, profiles) => {
          if (err) return reject(err)

          resolve(profiles)
        })
      )
    }),

    profile: (_, { id }, context) => new Promise((resolve, reject) => {
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
    createProfile: (_, { input }) => {
      const type = input.type
      let details = {}
      Object.keys(input).map(i => {
        if (i !== 'type') {
          details[i] = {
            set: input[i]
          }
        }
      })
      return new Promise((resolve, reject) => {
        sbot.profile.create(type, details, (err, profileId) => {
          if (err) {
            reject(err)
          }
          /* For full profile response */
          // const res = {
          //   id: profileId,
          //   ...input
          // }
          resolve(profileId)
        })
      })
    },
    updateProfile: (_, { input }) => {
      const id = input.id
      let update = {}
      Object.keys(input).map(i => {
        if (i === 'altNames') {
          update[i] = {
            add: input[i]
          }
        } else if (i !== 'id') {
          update[i] = {
            set: input[i]
          }
        }
      })
      return new Promise((resolve, reject) => {
        sbot.profile.update(id, update, (err, updateMsg) => {
          if (err) {
            reject(err)
          }
          resolve(updateMsg.key)
        })
      })
    }
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
  }
})
