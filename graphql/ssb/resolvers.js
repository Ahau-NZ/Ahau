const { PubSub } = require('apollo-server')
const pull = require('pull-stream')
const pullParamap = require('pull-paramap')
const isProfile = require('ssb-profile/lib/is-profile')

const pubsub = new PubSub()

module.exports = sbot => ({
  Query: {
    whoami: () =>
      new Promise((resolve, reject) => {
        sbot.whoami((err, info) => {
          if (err) {
            reject(err)
          }
          resolve(info.id)
        })
      }),
    profiles: () => {
      return new Promise((resolve, reject) => {
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
            (root, cb) => sbot.profile.get(root.key, cb),
            6 // "width" i.e. how many to simultaneously run in parallel
          ),
          pull.collect((err, profiles) => {
            if (err) return reject(err)

            const cleanProfiles = Object.entries(profiles)
              .map(([head, state]) => ({ head, state }))
              .map(profile => {
                const key = Object.keys(profile.state)[0]
                return {
                  id: key,
                  ...profile.state[key]
                }
              })
            resolve(cleanProfiles)
          })
        )
      })
    },
    profile: (_, { id }) => {
      return new Promise((resolve, reject) => {
        console.log('ID', id)
        sbot.profile.get(id, (err, profileState) => {
          console.log('ERRORS HERE', err)
          if (err) return reject(err)

          console.log('state', JSON.stringify(profileState, null, 2))
          const state = Object.values(profileState)[0]
          resolve({
            id,
            ...state
          })
        })
      })
    }
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
