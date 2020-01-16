const Graphql = require('./')
const Config = require('../ssb.config.js')

const sbot = require('secret-stack')({}) // eslint-disable-line
  .use(require('ssb-db'))
  .use(require('ssb-master'))
  .use(require('ssb-unix-socket'))
  .use(require('ssb-no-auth'))

  .use(require('ssb-conn'))
  .use(require('ssb-lan'))
  .use(require('ssb-replicate'))
  .use(require('ssb-friends'))
  .use(require('ssb-promiscuous'))

  .use(require('ssb-blobs'))

  .use(require('ssb-backlinks'))

  .use(require('ssb-whakapapa'))
  .use(require('ssb-profile'))
  .use(require('ssb-query'))
  .use(require('ssb-serve-blobs'))

  .call(null, Config())

Graphql(sbot)
