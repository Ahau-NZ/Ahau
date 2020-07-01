const { ApolloServer } = require('apollo-server-express')
const { buildFederatedSchema } = require('@apollo/federation')
const http = require('http')
const express = require('express')
const cors = require('cors')
const Main = require('@ssb-graphql/main')
const Profile = require('@ssb-graphql/profile')
const Invite = require('@ssb-graphql/invite')
const Whakapapa = require('@ssb-graphql/whakapapa')
const Artefact = require('@ssb-graphql/artefact')
const Story = require('@ssb-graphql/story')

module.exports = {
  name: 'graphql-http-server',
  version: '1.0.0',
  init: function (sbot, cfg) {
    const PORT = 4000
    const app = express()
    app.options('*', cors())
    const main = Main(sbot)
    const profile = Profile(sbot)
    const story = Story(sbot)
    const artefact = Artefact(sbot)
    const invite = Invite(sbot)
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
            typeDefs: artefact.typeDefs,
            resolvers: artefact.resolvers
          },
          {
            typeDefs: story.typeDefs,
            resolvers: story.resolvers
          },
          {
            typeDefs: invite.typeDefs,
            resolvers: invite.resolvers
          },
          {
            typeDefs: whakapapa.typeDefs,
            resolvers: whakapapa.resolvers
          }
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
}
