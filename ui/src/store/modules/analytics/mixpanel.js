import { throttle } from 'lodash-es'
import mixpanel from 'mixpanel-browser'

const {
  VUE_APP_MIXPANEL_TOKEN,
  VUE_APP_MIXPANEL_API_HOST = 'https://api-eu.mixpanel.com'
} = process.env

// Mixpanel is a analytics platform.
// We record anonymised telemetry about the apps usage
// This only includes:
//   - is the app open/ in use
//   - which version are you using
//   - is it on mobile
//   - rough country/region location

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const PERIOD = 1 * HOUR // don't fire additional events till an hour has passed

const dummyAPI = {
  track (...args) {
    // console.log('dummy analytics call:', ...args)
  }
}
dummyAPI.throttledTrack = throttle(dummyAPI.track, PERIOD)

const throttleMap = {
  // eventName: fn
}
// NOTE we want events to be throttled based on their eventName
// this map allows us to have a different throttled function per eventName

function initialize () {
  if (process.env.NODE_ENV === 'development') return dummyAPI
  if (process.env.NODE_ENV === 'test') return dummyAPI

  if (!VUE_APP_MIXPANEL_TOKEN) return console.warn('No MIXPANEL_TOKEN found!')

  if (!window.ahoy) {
    // eslint-disable-next-line no-console
    console.log('(analytics) window.ahoy not found - this is only accessible in electron')
    return dummyAPI
  }

  mixpanel.init(VUE_APP_MIXPANEL_TOKEN, { api_host: VUE_APP_MIXPANEL_API_HOST })

  window.ahoy.getConfig().then(config => {
    const mixpanelId = config.mixpanelId
    mixpanel.identify(mixpanelId)

    mixpanel.people.set({
      application: 'ahau',
      isPataka: false,
      isMobile: process.env.VUE_APP_PLATFORM === 'cordova',
      userId: mixpanelId
    })

    mixpanel.throttledTrack = (eventName, ...args) => {
      if (!throttleMap[eventName]) {
        throttleMap[eventName] = throttle(mixpanel.track, PERIOD, { trailing: false })
          .bind(mixpanel, eventName)
      }

      return throttleMap[eventName](...args)
    }
  })

  return mixpanel
}

export default initialize()
