const Stack = require('secret-stack')
const Config = require('./ssb.config')

const stack = Stack()

const plugins = [
  'ssb-db',
  // 'ssb-master',
  // 'ssb-unix-socket',
  // 'ssb-no-auth',

  'ssb-conn',
  'ssb-lan',
  'ssb-replicate',
  'ssb-friends',

  'ssb-blobs',
  'ssb-serve-blobs',
  'ssb-hyper-blobs',

  'ssb-query',
  'ssb-backlinks',

  'ssb-tribes',

  'ssb-profile',
  'ssb-settings',
  'ssb-story',
  'ssb-artefact',
  'ssb-whakapapa',

  'ssb-invite',
  'ssb-ahau',
  'ssb-recps-guard'
]

plugins.forEach(plugin => stack.use(require(plugin)))

stack(Config())
