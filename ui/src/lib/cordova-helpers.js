const CORDOVA_ENV_NAME = 'cordova'

function isCordova () {
  return process.env.VUE_APP_PLATFORM === CORDOVA_ENV_NAME
}

export { isCordova }
