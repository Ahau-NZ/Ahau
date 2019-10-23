const { ApolloServer } = require('apollo-server-express')
const http = require('http')
const express = require('express')
const cors = require('cors')
const pull = require('pull-stream')

const PORT = 4000
const app = express()
app.options('*', cors())

module.exports = sbot => {
  const { typeDefs, resolvers } = require('./ssb')(sbot)
  // A map of functions which return data for the schema.

  getContext(sbot, (err, context) => {
    if (err) throw err

    const server = new ApolloServer({
      typeDefs,
      context, // feedId, profileId
      resolvers
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

function getContext (sbot, cb) {
  pull(
    pull.once('go get it!'), // dummy entry
    pull.asyncMap((_, cb) => {
      sbot.whoami((err, data) => {
        if (err) cb(err)
        else cb(null, data.id)
      })
    }),
    pull.asyncMap((feedId, cb) => {
      sbot.profile.findByFeedId(feedId, (err, profileState) => {
        if (err) return cb(err)

        if (profileState) return cb(null, { feedId, profileId: profileState.key })

        console.warn('WARNING - this is setting initial name!')
        const details = {
          preferredName: { set: 'mix' },
          altNames: { mixy: 1, john: 0, mixmix: 2 }
        }
        sbot.profile.create('person', details, (err, profileId) => {
          if (err) return cb(err)

          sbot.profile.link.create({ profile: profileId }, (err, link) => {
            if (err) return cb(err)

            cb(null, { feedId, profileId })
          })
        })
      })
    }),
    pull.collect((err, data) => {
      if (err) cb(err)
      else cb(null, data[0])
    })
  )
}
