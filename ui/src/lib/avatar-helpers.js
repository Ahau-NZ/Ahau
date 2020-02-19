import koro from '../assets/koro.svg'
import kuia from '..//assets/kuia.svg'
import tane from '../assets/tane.svg'
import wahine from '../assets/wahine.svg'
import tama from '../assets/tama.svg'
import kotiro from '../assets/kotiro.svg'

import whakapapa from '@/assets/whakapapa.svg'

import calculateAge from './calculate-age'

export default {
  defaultImage
}

function defaultImage (isView, bornAt, gender) {
  if (isView) {
    return whakapapa
  }
  var age = calculateAge(bornAt)

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
