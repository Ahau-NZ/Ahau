/* nodejs is included by Cordova */
/* eslint-disable no-undef */
const noop = () => {}

const nodejsClient = {
  start ({ onStartup, onReady, onAnyMessage } = {}) {
    console.log('Starting nodejs-mobile server')
    if (onReady) nodejs.channel.on('initialized', onReady)
    if (onAnyMessage) nodejs.channel.setListener(onAnyMessage)
    nodejs.start('main.js', onStartup || noop)
  }
}

export default nodejsClient
