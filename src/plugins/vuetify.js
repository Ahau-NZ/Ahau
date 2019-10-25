import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import VImageInput from 'vuetify-image-input'

Vue.component(VImageInput.name, VImageInput)
Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#383838',
        secondary: '#A80000',
        accent: '#A70000',
        error: '#ff0000'
      }
    }
  },
  icons: {
    iconfont: 'mdi'
  }
})
