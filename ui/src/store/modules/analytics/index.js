import mixpanel from './mixpanel'

const mobileVersion = require('../../../../../mobile/package.json').version
const desktopVersion = require('../../../../../desktop/package.json').version

console.log({ mobileVersion, desktopVersion })
const version = process.env.VUE_APP_PLATFORM === 'cordova' // isMobile?
  ? mobileVersion
  : desktopVersion

const state = {}
const getters = {}
const mutations = {}

const actions = {
  appUsed ({ state, commit }) {
    mixpanel.throttledTrack('using-app', { version })
    // NOTE thottled means means we can call this action as much as we want and
    // mixpanel will only be hit e.g. once an hour (for this particular event)
    //
    // returns undefined if it was throttled, or an object if it went through
    //
    // NOTE the returned object only guarentees the event was queued for sending
    // not that it actually sent
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
