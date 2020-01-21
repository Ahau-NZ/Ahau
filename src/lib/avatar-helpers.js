import koro from '../assets/koro.svg'
import kuia from '..//assets/kuia.svg'
import tane from '../assets/tane.svg'
import wahine from '../assets/wahine.svg'
import tama from '../assets/tama.svg'
import kotiro from '../assets/kotiro.svg'

export default {
  calculateAge,
  defaultImage
}

function calculateAge (bornAt) {
  var date = new Date(bornAt)
  var diffMs = Date.now() - date.getTime()
  var ageDt = new Date(diffMs)
  var age = Math.abs(ageDt.getUTCFullYear() - 1970)
  return age
}

function defaultImage (bornAt, gender) {
  var age = calculateAge(bornAt)
  switch (gender) {
    case 'male':
      switch (true) {
        case (age <= 12): return tama
        case (age > 50): return koro
        default: return tane
      }
    case 'female':
      switch (true) {
        case (age <= 12): return kotiro
        case (age > 50): return kuia
        default: return wahine
      }
    default: return wahine
  }
}