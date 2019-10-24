const Graphql = require('./')
const Config = require('../ssb.config.js')

const sbot = require('secret-stack')({}) // eslint-disable-line
  .use(require('ssb-db'))
  .use(require('ssb-master'))

  .use(require('ssb-conn'))
  // .use(require('ssb-replicate'))
  .use(require('ssb-friends'))

  .use(require('ssb-backlinks'))
  .use(require('ssb-profile'))
  .use(require('ssb-query'))
  .call(null, Config())

Graphql(sbot)
