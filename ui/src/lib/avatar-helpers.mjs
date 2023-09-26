import koro from '@/assets/koro.svg'
import kuia from '@/assets/kuia.svg'
import tane from '@/assets/tane.svg'
import wahine from '@/assets/wahine.svg'
import tama from '@/assets/tama.svg'
import kotiro from '@/assets/kotiro.svg'
import account from '@/assets/account-2.svg'
import account2 from '@/assets/account-fill.svg'

import whakapapa from '@/assets/whakapapa.svg'
import whakapapaPng from '@/assets/whakapapa.webp'

import calculateAge from './calculate-age'
import { isCordova } from './cordova-helpers'

function defaultImage (isView, aliveInterval, gender, noAvatar, isNode) {
  if (isView) {
    if (isCordova()) return whakapapaPng

    return whakapapa
  }
  if (noAvatar) return account

  const age = calculateAge(aliveInterval)

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
      return isNode ? account2 : account
    case 'unknown':
      return isNode ? account2 : account
    case 'female':
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
    default:
      return isNode ? account2 : account
  }
}

export default {
  defaultImage
}
