import { DECEASED_COLOUR, ALIVE_COLOUR } from '@/lib/constants'

import en from 'vuetify/es5/locale/en'
import pt from 'vuetify/es5/locale/pt'

export default {
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#383838',
        secondary: '#b12526',
        accent: '#A70000',
        error: '#ff0000',
        alive: ALIVE_COLOUR,
        deceased: DECEASED_COLOUR
      }
    },
    options: {
      customProperties: true
    }
  },
  icons: {
    iconfont: 'mdi'
  },
  lang: {
    locales: { en, pt },
    current: 'en'
  }
}
