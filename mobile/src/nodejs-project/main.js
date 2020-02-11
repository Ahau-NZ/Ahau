const os = require('os')
const path = require('path')
const cordova = require('cordova-bridge')

// Set default directory
const nodejsProjectDir = path.resolve(cordova.app.datadir(), 'nodejs-project')
os.homedir = () => nodejsProjectDir
process.cwd = () => nodejsProjectDir

process.env = process.env || {}
process.env.PLATFORM = 'cordova'
// process.env.DEBUG = '*'; // uncomment this to debug! don't commit it tho

require('./index.js')
