module.exports = [
  require('ssb-db'),
  require('ssb-query'),
  require('ssb-backlinks'),

  require('ssb-conn'), // needs: db, friends, lan
  require('ssb-lan'),
  require('ssb-replicate'), // needs: db
  require('ssb-friends'), // needs: db, replicate

  require('ssb-blobs'),
  require('ssb-serve-blobs'), // needs: blobs
  require('ssb-hyper-blobs'),

  require('ssb-invite'), // needs: db, conn
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
