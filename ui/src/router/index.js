import Vue from 'vue'
import Router from 'vue-router'

import views from './modules/views'
// import dialogs from './modules/dialogs'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    ...views,
    // ...dialogs,
    { path: '/', redirect: '/tribe/%25mqqY3VPfL6KWN1R2dE7mssSri2ergXFYJ5isHDGOCGw=.cloaked/person/%25CBPFpRpn+EUJlcvkiLngyvzTTPG569xeVquV+Pop8p4=.sha256/archive' },
    { path: '/logout', redirect: '' },
    { path: '*', redirect: '/tribe/%25mqqY3VPfL6KWN1R2dE7mssSri2ergXFYJ5isHDGOCGw=.cloaked/person/%25CBPFpRpn+EUJlcvkiLngyvzTTPG569xeVquV+Pop8p4=.sha256/archive' }
  ]
})
