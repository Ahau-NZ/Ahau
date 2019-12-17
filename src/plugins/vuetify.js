import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import 'typeface-roboto'

import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import VImageInput from 'vuetify-image-input'
import config from '../../vuetify.config.js'

Vue.use(Vuetify)
Vue.component(VImageInput.name, VImageInput)

export default new Vuetify(config)
