module.exports = [
  require('ssb-db'),
  require('ssb-query'),
  require('ssb-backlinks'),

  require('ssb-conn'),
  require('ssb-lan'),
  require('ssb-replicate'),
  require('ssb-friends'),

  require('ssb-blobs'),
  require('ssb-serve-blobs'),
  require('ssb-hyper-blobs'),

  require('ssb-invite'),
  require('ssb-tribes'),
  require('ssb-tribes-registration'),

  require('ssb-profile'),
  require('ssb-settings'),
  require('ssb-story'),
  require('ssb-artefact'),
  require('ssb-whakapapa'),
  require('ssb-submissions'),

  require('ssb-ahau'),
  require('ssb-atala-prism'),
  require('ssb-recps-guard')
]
