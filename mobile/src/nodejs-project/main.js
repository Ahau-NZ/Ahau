const os = require('os')
const path = require('path')
const cordova = require('cordova-bridge')
const envs = require('./env.json')

// Set default directory
const nodejsProjectDir = path.resolve(cordova.app.datadir(), 'nodejs-project')
os.homedir = () => nodejsProjectDir
process.cwd = () => nodejsProjectDir

process.env = process.env || {}
// process.env.DEBUG = '*'; // uncomment this to debug! don't commit it tho

Object.keys(envs).forEach(key => { process.env[key] = envs[key] })

require('./index.js')
