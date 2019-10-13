const { ApolloServer, gql } = require('apollo-server')
// const { typeDefs, resolvers } = require('./ssb')
module.exports = sbot => {
  console.log('Starting GraphQL Server')
  const typeDefs = gql`
    type Query {
      "Scuttlebutt Who am I"
      whoami: String
    }
  `

  // A map of functions which return data for the schema.
  const resolvers = {
    Query: {
      whoami: () =>
        new Promise((resolve, reject) => {
          sbot.whoami((err, info) => {
            if (err) {
              reject(err)
            }
            setTimeout(
              () => resolve(info.id),
              1e3
            )
          })
        })
    }
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers
  })

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`)
  })
}
