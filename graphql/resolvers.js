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
const getWhakapapa = require('./ssb/whakapapa')

const pubsub = new PubSub()

function reduceWhakapapaNode (nodes) {
  return nodes.reduce((acc, curr) => {
    const existingIndex = acc.findIndex(i => i.profileId === curr.profileId)
    if (existingIndex === -1) {
      return acc.concat(curr)
    } else {
      let newArray = acc.map(entry => {
        let newObject = {}
        Object.entries(entry).map(([key, value]) => {
          if (curr[key]) {
            newObject[key] = curr[key]
          } else {
            newObject[key] = value
          }
        })
        return newObject
      })
      return newArray
    }
  }, [])
}

module.exports = sbot => ({
  Query: {
    whoami: async (_, __, { feedId, profileId }) => {
      const profile = await getProfile(sbot, profileId)
      return {
        id: feedId,
        feedId,
        profile: addURIs(profile)
      }
    },
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

    profile: async (_, { id }, { feedId, profileId }) => {
      const profile = await getProfile(sbot, id)
      return {
        id,
        authors: profile.authors,
        canEdit: profile.authors.includes(feedId), // WIP
        ...addURIs(profile)
      }
    },
    whakapapa: async (_, { id }, { feedId, profileId }) => {
      if (!id) {
        id = profileId
      }
      try {
        const whakapapa = await getWhakapapa(sbot, id)
        let response = await getProfile(sbot, id)
        const reducedParents = await reduceWhakapapaNode(whakapapa.parents)
        const reducedChildren = await reduceWhakapapaNode(whakapapa.children)
        response.parents = await reducedParents.map(async parent => {
          return getProfile(sbot, parent.profileId)
        })
        response.children = await reducedChildren.map(async child => {
          return getProfile(sbot, child.profileId)
        })
        return response
      } catch (err) {
        return err
      }
    },
    whakapapaView: (_, { id }, { feedId, profileId }) => new Promise((resolve, reject) => {
      sbot.whakapapa.view.get(id, (err, view) => {
        if (err) reject(err)
        resolve(view)
      })
    })
  },
  // Person: (_, { id }, { feedId, profileId }) =>
  //   new Promise((resolve, reject) => {
  //     getProfile(sbot, id, (err, profile) => {
  //       if (err) return reject(err)

  //       resolve({
  //         id,
  //         authors: profile.authors,
  //         canEdit: profile.authors.includes(feedId), // WIP
  //         ...addURIs(profile)
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

    saveWhakapapaRelation: (_, { input }) => {
      const { relationshipId, child, parent, relationshipType, legallyAdopted, recps } = input
      const opts = {
        recps,
        legallyAdopted: { set: legallyAdopted || false },
        relationshipType: { set: relationshipType || 'unknown' }
      }
      if (relationshipId) {
        return new Promise((resolve, reject) => {
          sbot.whakapapa.child.update(relationshipId, opts, (err) => {
            if (err) reject(err)
            resolve('Updated!')
          })
        })
      } else if (child && parent) {
        return new Promise((resolve, reject) => {
          sbot.whakapapa.child.create({ parent, child }, opts, (err, id) => {
            if (err) reject(err)
            resolve(id)
          })
        })
      } else {
        throw new Error('Invalid input')
      }
    },
    saveWhakapapaView: (_, { input }, { feedId, profileId }) => {
      const {
        viewId,
        name,
        description,
        focus,
        mode,
        recps
      } = input
      const details = {
        name: name ? { set: name } : null,
        description: description ? { set: description } : null,
        focus: { set: focus || profileId },
        mode: { set: mode || 'descendants' },
        recps: recps ? recps.length < 1 ? [profileId] : recps : null
      }
      if (viewId) {
        return new Promise((resolve, reject) => {
          sbot.whakapapa.view.update(viewId, details, (err) => {
            if (err) reject(err)
            resolve('Updated!')
          })
        })
      } else {
        return new Promise((resolve, reject) => {
          sbot.whakapapa.view.create(details, (err, id) => {
            if (err) reject(err)
            resolve(id)
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
