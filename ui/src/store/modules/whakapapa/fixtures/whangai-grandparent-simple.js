import { State } from '../lib/test-helpers'

/* whangai to grandparent */
//    Grandad --
//      |      |
//     Son     |
//      |      |
//  Grandaughter
//      |
//     Baby

export default function WhangaiGrandparentSimple () {
  return State({
    view: {
      focus: 'Grandad',
      extendedFamily: false
    },
    childLinks: {
      Grandad: {
        Son: 'birth',
        Grandaughter: 'whangai'
      },
      Son: {
        Grandaughter: 'birth'
      },
      Grandaughter: {
        Baby: 'birth'
      }
    }
  })
}
