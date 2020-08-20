const http = require('http')
const express = require('express')
const cors = require('cors')

const { ApolloServer } = require('apollo-server-express')
const { buildFederatedSchema } = require('@apollo/federation')
const Main = require('@ssb-graphql/main')
const Tribes = require('@ssb-graphql/tribes')
const Profile = require('@ssb-graphql/profile')
const Whakapapa = require('@ssb-graphql/whakapapa')
const Artefact = require('@ssb-graphql/artefact')
const Story = require('@ssb-graphql/story')

module.exports = function graphqlServer (sbot) {
  const PORT = 4000
  const app = express()
  app.options('*', cors())

  const main = Main(sbot)
  const profile = Profile(sbot)
  const tribes = Tribes(sbot, profile.gettersWithCache)
  const story = Story(sbot)
  const artefact = Artefact(sbot)
  const whakapapa = Whakapapa(sbot, { ...profile.gettersWithCache, ...story.gettersWithCache, ...artefact.gettersWithCache })

  main.loadContext((err, context) => {
    if (err) throw err

    const server = new ApolloServer({
      schema: buildFederatedSchema([
        main,
        tribes,
        profile,
        artefact,
        story,
        whakapapa
      ]),
      context,
      mockEntireSchema: false,
      mocks: process.env.MOCK === true ? require('./mocks') : false
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
      if (process.env.PLATFORM === 'cordova') {
        require('cordova-bridge').channel.post(
          'initialized',
          JSON.stringify({ started: true })
        )
      }
    })
  })
}
