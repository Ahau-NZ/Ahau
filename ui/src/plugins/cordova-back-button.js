const MyPlugin = {}

MyPlugin.install = function (Vue, options) {
  if (process.env.VUE_APP_PLATFORM !== 'cordova') {
    return
  }
  const handlers = []

  function created () {
    if (this.cordovaBackButton) {
      handlers.unshift(this.cordovaBackButton)
    }
  }
  function destroyed () {
    if (this.cordovaBackButton) {
      handlers.shift()
    }
  }

  document.addEventListener('backbutton', (ev) => {
    if (handlers.length > 0) {
      handlers[0]()
      ev.preventDefault()
    } else {
      options.router.back()
    }
  }, false)

  Vue.mixin({ created, destroyed })
}

export default MyPlugin
