import { DECEASED_COLOUR, ALIVE_COLOUR } from '@/lib/constants.js'

export default {
  theme: {
    dark: true,
    themes: {
      dark: {
        primary: '#383838',
        secondary: '#A80000',
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
  }
}