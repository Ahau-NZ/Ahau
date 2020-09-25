import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import 'typeface-roboto'

import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import config from '../../vuetify.config'

Vue.use(Vuetify)

export default new Vuetify(config)
