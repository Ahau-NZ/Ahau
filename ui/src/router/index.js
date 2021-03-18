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
    // { path: '/', redirect: '/login' },
    { path: '/', redirect: '/tribe/%25VQa5Fs95t2DdpbZSDy6lChf9R6tJMeCTKceK2zNldQc=.cloaked/community/%25lEokbSli5Rr3FErwdq+I9z3lEIFnKkx8WrSVURaJ9CQ=.sha256/profile' },

    // WIP
    // - loading whole video into memory!!!! (no backpressure)
    // - double-clicking a file in file picker triggers multuple hyper-blobs add
    // - large files do upload sometimes
    //   - sound works on frozen
    //   - doesn't work for expanse, but if you download it it does (suggests odd audio encoding)
    // - have only tried mp4
    // - we need an "uploading" spinner

    { path: '/logout', redirect: '/login' },
    { path: '*', redirect: '/' }
  ]
})
