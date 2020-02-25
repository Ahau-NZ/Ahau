/* nodejs is included by Cordova */
/* eslint-disable no-undef */
const noop = () => {}

const nodejsClient = {
  init ({ startupListener, channelListener } = {}) {
    if (channelListener) nodejs.channel.setListener(channelListener)
    console.log('Starting nodejs-mobile server')
    nodejs.start('main.js', startupListener || noop)
  },
  hasStarted (cb) {
    nodejs.channel.on('initialized', () => {
      console.log('SERVER UP!')
      cb()
    })
  }
}

export default nodejsClient
