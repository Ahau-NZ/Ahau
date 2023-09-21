import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import 'typeface-roboto'

import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import { Scroll, ClickOutside } from 'vuetify/lib/directives'
import config from '../../vuetify.config'

Vue.use(Vuetify, {
  directives: {
    Scroll,
    ClickOutside
  }
})

export default new Vuetify(config)
