import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#383838',
        secondary: '#A80000',
        accent: '#A70000',
        error: 'red'
      }
    }
  },
  icons: {
    iconfont: 'mdi'
  }
})
