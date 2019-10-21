const { gql, PubSub } = require('apollo-server')
const pull = require('pull-stream')
// const typeDefs = require('./typeDefs')
// const resolvers = require('./resolvers')
const pubsub = new PubSub()

module.exports = sbot => {
  const typeDefs = gql`
    input ProfileInput {
      preferredName: String
      legalName: String
      altNames: [String]
      avatarImage: String
      headerImage: String
      description: String
    }
    input CommunityInput {
      preferredName: String
      legalName: String
      altNames: [String]
      avatarImage: String
      headerImage: String
      description: String
    }
    type Community {
      preferredName: String
      legalName: String
      altNames: [String]
      avatarImage: String
      headerImage: String
      description: String
    }
    type Peer {
      id: String
      state: String
    }
    type Profile {
      id: String
      preferredName: String
      legalName: String
      altNames: [String]
      avatarImage: String
      headerImage: String
      description: String
    }
    type Query {
      "Scuttlebutt Who am I"
      whoami: String
      "Scuttlebutt identity profile"
      profile(id: String!): Profile
      "Scuttlebutt community"
      communities: [Community]
    }
    type Mutation {
      saveProfile(input: ProfileInput): Profile
    }
    type Subscription {
      peers: [Peer]
    }
  `
  const resolvers = {
    Query: {
      whoami: () =>
        new Promise((resolve, reject) => {
          sbot.whoami((err, info) => {
            if (err) {
              reject(err)
            }
            setTimeout(() => resolve(info.id), 1e3)
          })
        }),
      profile: (_, { id }) => {
        console.log('ID', id)
        return new Promise((resolve, reject) => {
          sbot.profile.get({ profileId: id }, (err, profileState) => {
            if (err) {
              reject(err)
            }
            console.log(profileState)
            resolve(profileState)
          })
        })
      }
    },
    Mutation: {
      saveProfile: async (_, { input }) => {
        const type = 'person'
        const details = {
          preferredName: { set: 'Ben' },
          description: { set: 'Kia orano, Ko te Mata Atau te waka' }
        }
        try {
          return await sbot.profile.create(type, details, (err, profileId) => {
            if (err) {
              console.log('TCL: err', err)
            }
            console.log('TCL: profileId', profileId)

            console.log()
          })
        } catch (err) {
          throw err
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
    }
  }
  return {
    typeDefs,
    resolvers
  }
}
