const { ApolloServer } = require('apollo-server-express')
const { buildFederatedSchema } = require('@apollo/federation')
const http = require('http')
const express = require('express')
const cors = require('cors')

const Main = require('@ssb-graphql/main')
const Profile = require('@ssb-graphql/profile')
const Whakapapa = require('@ssb-graphql/whakapapa')

const PORT = 4000
const app = express()
app.options('*', cors())

module.exports = sbot => {
  const main = Main(sbot)
  const profile = Profile(sbot)
  const whakapapa = Whakapapa(sbot, profile.gettersWithCache)
  profile.Context((err, context) => {
    if (err) throw err

    const server = new ApolloServer({
      schema: buildFederatedSchema([
        {
          typeDefs: main.typeDefs,
          resolvers: main.resolvers
        },
        {
          typeDefs: profile.typeDefs,
          resolvers: profile.resolvers
        },
        {
          typeDefs: whakapapa.typeDefs,
          resolvers: whakapapa.resolvers
        }
      ]),
      context
    })

    server.applyMiddleware({ app })

    const httpServer = http.createServer(app)
    server.installSubscriptionHandlers(httpServer)

    // ⚠️ Pay attention to the fact that we are calling `listen` on the http server variable, and not on `app`.
    httpServer.listen(PORT, () => {
      console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
      )
      console.log(
        `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
      )
    })
  })
}
