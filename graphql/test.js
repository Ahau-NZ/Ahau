const Graphql = require('./')
const config = require('../ssb.config.js')

const sbot = require('secret-stack')({}) // eslint-disable-line
  .use(require('ssb-db'))
  .use(require('ssb-master'))
  .use(require('ssb-conn'))
  .use(require('ssb-backlinks'))
  .use(require('ssb-profile'))
  .use(require('ssb-query'))
  .use(require('ssb-replicate'))
  .call(null, config)

Graphql(sbot)
