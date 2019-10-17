const { ApolloServer, gql, MockList } = require('apollo-server')
const casual = require('casual')
// const { typeDefs, resolvers } = require('./ssb')

module.exports = sbot => {
  const typeDefs = gql`
    type Profile {
      preferredName: String
      legalName: String
      altNames: [String]
      avatarImage: String
      coverImage: String
      description: String
    }
    type Query {
      "Scuttlebutt Who am I"
      whoami: String
      "Scuttlebutt profile"
      profile: Profile
    }
  `

  const mocks = {
    Query: () => ({
      profile: () => ({
        preferredName: () => casual.name,
        legalName: () => casual.full_name,
        altNames: () => new MockList([0, 4], () => casual.name),
        avatarImage: () => 'https://picsum.photos/300/300',
        coverImage: () => 'https://picsum.photos/800/300',
        description: () => casual.catch_phrase
      })
    })
  }

  // A map of functions which return data for the schema.
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
        })
    }
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    mockEntireSchema: false,
    mocks: process.env.NODE_ENV === 'production' ? false : mocks
  })

  server.listen().then(({ url }) => {
    console.log(`GraphQL server ready at ${url}`)
  })
}
