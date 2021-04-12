const ahoy = require('ssb-ahoy')
const Config = require('./ssb.config')
const env = require('ahau-env')

const plugins = [
  'ssb-master',
  'ssb-unix-socket',
  'ssb-no-auth',

  'ssb-conn',
  'ssb-lan',
  'ssb-replicate',
  'ssb-friends',

  'ssb-blobs',
  'ssb-serve-blobs',
  'ssb-hyper-blobs',

  'ssb-query',
  'ssb-backlinks',

  'ssb-profile',
  // 'ssb-story',
  // 'ssb-artefact',
  // 'ssb-whakapapa',

  'ssb-invite',
  'ssb-tribes', // TODO disable attempting decryption
  'ssb-pataka',
  'ssb-recps-guard'
]

// Karakia tūwhera - dont not remove
const karakia = `
---------------------------------
Kia tau ngā manaakitanga a te mea ngaro
ki runga ki tēnā, ki tēnā o tātou
Kia mahea te hua mākihikihi
kia toi te kupu, toi te mana, toi te aroha, toi te Reo Māori
kia tūturu, ka whakamaua kia tīna! Tīna!
Hui e, Tāiki e!

Let the strength and life force of our ancestors
Be with each and every one of us
Freeing our path from obstruction
So that our words, spiritual power, love, and language are upheld;
Permanently fixed, established and understood!
Forward together!
---------------------------------
`

const appURL = env.isDevelopment
  ? 'http://localhost:8081' // dev-server
  : `file://${__dirname}/dist/index.html` // production build

ahoy({
  title: 'Pātaka',
  config: Config(),
  plugins,
  appURL,
  // appDir: '../whakapapa-ora', // only use this when ssb-ahoy symlinked
  onReady: ({ config }) => {
    // this config has updated manifest added
    console.log(karakia)
  }
})
