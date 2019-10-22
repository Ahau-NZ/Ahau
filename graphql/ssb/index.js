const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

module.exports = sbot => {
  return {
    typeDefs,
    resolvers: resolvers(sbot)
  }
}
