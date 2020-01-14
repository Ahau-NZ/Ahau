const { PubSub } = require('apollo-server')
const { GraphQLUpload } = require('graphql-upload')
const GraphQLDate = require('graphql-date')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const toUrl = require('ssb-serve-blobs/id-to-url')
const pick = require('lodash.pick')

const getPersons = require('./ssb/get-persons')
const getProfile = require('./ssb/get-profile')
const getCommunities = require('./ssb/get-communities')
const getViews = require('./ssb/get-views')
const getCloseWhakapapa = require('./ssb/get-close-whakapapa')

const pubsub = new PubSub()

module.exports = sbot => ({
  Query: {
    whoami: async (_, __, { feedId, profileId }) => {
      const profile = await getProfile(sbot, profileId)
      return {
        id: feedId,
        feedId,
        profile
      }
    },
    persons: () =>
      new Promise((resolve, reject) => {
        getPersons(sbot, (err, profiles) => {
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

    views: () =>
      new Promise((resolve, reject) => {
        getViews(sbot, (err, views) => {
          if (err) reject(err)
          else resolve(views)
        })
      }),

    profile: async (_, { id }, { feedId, profileId }) => {
      const profile = await getProfile(sbot, id)
      return {
        ...profile,
        canEdit: profile.authors.includes(feedId) // WIP
      }
    },
    closeWhakapapa: async (_, { id }, { feedId, profileId }) => {
      try {
        return getCloseWhakapapa(sbot, id || profileId)
      } catch (err) {
        throw err
      }
    },
    whakapapaView: (_, { id }, { feedId, profileId }) =>
      new Promise((resolve, reject) => {
        sbot.whakapapa.view.get(id, (err, view) => {
          if (err) reject(err)
          else resolve(view)
        })
      })
  },
  // TODO: make profile and whakapapa a implementation of Person
  // Person: (_, { id }, { feedId, profileId }) =>
  //   new Promise((resolve, reject) => {
  //     getProfile(sbot, id, (err, profile) => {
  //       if (err) return reject(err)

  //       resolve({
  //         id,
  //         authors: profile.authors,
  //         canEdit: profile.authors.includes(feedId), // WIP
  //         ...profile
  //       })
  //     })
  //   }),

  Profile: {
    tiaki: (obj) =>
      new Promise((resolve, reject) => {
        pull(
          pull.values(obj.authors),
          pull.asyncMap((author, cb) => {
            sbot.profile.findByFeedId(author, cb)
          }),
          pull.collect((err, profiles) => {
            if (err) reject(err)
            else {
              profiles = profiles.map(profile => {
                return {
                  id: profile.key,
                  // WARNING! we're assuming just one head-state!
                  ...profile.states[0].state
                }
              })
              resolve(profiles)
            }
          })
        )
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

    // TODO collect create/update into saveProfile
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
      }),

    // TODO align naming across stack : link / relation / child
    saveWhakapapaRelation: (_, { input }, { feedId, profileId }) => {
      const { relationshipId, child, parent } = input
      const opts = buildWhakapapaLinkOpts(input)

      if (relationshipId) {
        return new Promise((resolve, reject) => {
          sbot.whakapapa.child.update(relationshipId, opts, (err) => {
            if (err) reject(err)
            else resolve('Updated!')
          })
        })
      } else if (child && parent) {
        return new Promise((resolve, reject) => {
          sbot.whakapapa.child.create({ parent, child }, opts, (err, id) => {
            if (err) reject(err)
            else resolve(id)
          })
        })
      } else {
        throw new Error('Invalid input')
      }
    },
    saveWhakapapaView: (_, { input }, { feedId, profileId }) => {
      const { id } = input
      const details = buildWhakakakaViewOpts(input)

      if (id) {
        return new Promise((resolve, reject) => {
          sbot.whakapapa.view.update(id, details, (err) => {
            if (err) reject(err)
            else resolve('Updated!')
          })
        })
      } else {
        return new Promise((resolve, reject) => {
          sbot.whakapapa.view.create(details, (err, id) => {
            if (err) reject(err)
            else resolve(id)
          })
        })
      }
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
  },
  Upload: GraphQLUpload,
  Date: GraphQLDate
})

function buildTransformation (input) {
  let T = {}

  Object.entries(input).forEach(([key, value]) => {
    switch (key) {
      case 'type': return
      case 'id': return

      case 'altNames':
        // TODO
        return

      case 'avatarImage':
        T[key] = { set: pick(value, ['blob', 'mimeType', 'size', 'width', 'height']) }
        return
      case 'headerImage':
        T[key] = { set: pick(value, ['blob', 'mimeType', 'size', 'width', 'height']) }
        return

      case 'tombstone':
        T[key] = { set: pick(value, ['date', 'reason']) }
        T[key].set.date = Number(T[key].set.date)
        // graphql only allows 32bit signed Ints
        // so we're passing a Date and converting it to Int for ssb
        return
      case 'bornAt':
        T[key] = { set: Number(value) }
        return

      case 'recps':
        T[key] = value
        return

      default:
        T[key] = { set: value }
    }
  })

  return T
}

function buildWhakapapaLinkOpts (input) {
  const permittedAttrs = ['relationshipType', 'legallyAdopted', 'recps']

  let opts = pick(input, permittedAttrs)
  Object.entries(opts).forEach(([key, value]) => {
    if (key === 'recps') return
    opts[key] = { set: value }
  })

  return opts
}

function buildWhakakakaViewOpts (input) {
  const permittedAttrs = ['name', 'description', 'focus', 'mode', 'recps']
  // NOTE recps will be ignored in updates

  let details = pick(input, permittedAttrs)
  Object.entries(details).forEach(([key, value]) => {
    if (key === 'recps') return
    details[key] = { set: value }
  })

  return details
}
