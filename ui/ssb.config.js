const Config = require('ssb-config/defaults')
const env = require('ahau-env')

module.exports = Config(env.ahau.appName)
