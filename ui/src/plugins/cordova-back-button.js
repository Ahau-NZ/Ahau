const cordovaBackButtonPlugin = {}

cordovaBackButtonPlugin.install = function (Vue, options) {
  if (process.env.VUE_APP_PLATFORM !== 'cordova') {
    return
  }
  let handlers = []

  function created () {
    if (this.cordovaBackButton && this._uid) {
      handlers.unshift([this._uid, this.$parent._uid, this.cordovaBackButton])
    }
  }
  function destroyed () {
    if (this.cordovaBackButton && this._uid) {
      const uid = this._uid
      handlers = handlers.filter(h =>
        h[0] !== uid && h[1] !== uid)
    }
  }

  document.addEventListener('backbutton', (ev) => {
    if (handlers.length > 0) {
      const handler = handlers[0]
      // receives a value to know about removing the handler
      const removeHandler = handler[2]()

      if (removeHandler !== false) handlers.shift()
      ev.preventDefault()
    } else {
      options.router.back()
    }
  }, false)

  Vue.mixin({ created, destroyed })
}

export default cordovaBackButtonPlugin
