const { ApolloServer } = require('apollo-server-express')
const { buildFederatedSchema } = require('@apollo/federation')
const http = require('http')
const express = require('express')
const cors = require('cors')
const Main = require('@ssb-graphql/main')
const Profile = require('@ssb-graphql/profile')
const Invite = require('@ssb-graphql/invite')
const stats = require('@ssb-graphql/stats')
const Pataka = require('@ssb-graphql/pataka')

// const { PubSub } = require('apollo-server')
// const pubsub = new PubSub()

module.exports = {
  name: 'graphql-http-server',
  version: '1.0.0',
  init: function (sbot, cfg) {
    const PORT = 4001
    const app = express()
    app.options('*', cors())
    const main = Main(sbot)
    const profile = Profile(sbot)
    const invite = Invite(sbot)
    const pataka = Pataka(sbot, profile.gettersWithCache)
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
            typeDefs: invite.typeDefs,
            resolvers: invite.resolvers
          },
          {
            typeDefs: pataka.typeDefs,
            resolvers: pataka.resolvers
          },
          {
            typeDefs: stats.typeDefs,
            resolvers: stats.resolvers
          }
        ]),
        context,
        // context: { ...context, pubsub },
        mockEntireSchema: false
      })
      server.applyMiddleware({ app })

      const httpServer = http.createServer(app)
      server.installSubscriptionHandlers(httpServer)

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
}
