import koro from '../assets/koro.svg'
import kuia from '../assets/kuia.svg'
import tane from '../assets/tane.svg'
import wahine from '../assets/wahine.svg'
import tama from '../assets/tama.svg'
import kotiro from '../assets/kotiro.svg'
import diverse from '../assets/diverse.svg'

import whakapapa from '../assets/whakapapa.svg'
import whakapapaPng from '../assets/whakapapa.png'

import calculateAge from './calculate-age'
import { isCordova } from './cordova-helpers'

export default {
  defaultImage
}

function defaultImage (isView, aliveInterval, gender) {
  if (isView) {
    if (isCordova()) return whakapapaPng

    return whakapapa
  }
  var age = calculateAge(aliveInterval)

  switch (gender) {
    case 'male':
      switch (true) {
        case age === null:
          return tane
        case age <= 12:
          return tama
        case age > 50:
          return koro
        default:
          return tane
      }
    case 'other':
      return diverse
    case 'unknown':
      return diverse
    default:
      switch (true) {
        case age === null:
          return wahine
        case age <= 12:
          return kotiro
        case age > 50:
          return kuia
        default:
          return wahine
      }
  }
}
