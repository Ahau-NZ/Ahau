/* nodejs is included by Cordova */
/* eslint-disable no-undef */
const noop = () => {}

const nodejsClient = {
  init ({ startupListener, channelListener, onHTTPServerReady } = {}) {
    if (channelListener) nodejs.channel.setListener(channelListener)
    if (onHTTPServerReady) nodejs.channel.on('http-server', onHTTPServerReady)
    console.log('Starting nodejs-mobile server')
    nodejs.start('main.js', startupListener || noop)
  },
  hasStarted (cb) {
    nodejs.channel.on('initialized', e => {
      console.log('SERVER UP!')
      cb()
    })
  }
}

export default nodejsClient
