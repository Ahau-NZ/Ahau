const { ApolloServer } = require('apollo-server-express')
const http = require('http')
const express = require('express')
const cors = require('cors')
const typeDefs = require('./typeDefs')
const Resolvers = require('./resolvers')
const Context = require('./ssb/queries/get-context')

const PORT = 4000
const app = express()
app.options('*', cors())

module.exports = sbot => {
  Context(sbot, (err, context) => {
    if (err) throw err

    const server = new ApolloServer({
      typeDefs,
      context, // feedId, profileId
      resolvers: Resolvers(sbot)
      // mockEntireSchema: false,
      // mocks: process.env.NODE_ENV === 'production' ? false : require('./ssb/mocks')
      // cacheControl: {
      //   defaultMaxAge: 5
      // }
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
