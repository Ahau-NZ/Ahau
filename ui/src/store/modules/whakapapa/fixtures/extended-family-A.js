import { State } from '../lib/test-helpers'

// A has children:
//   - ax
//   - ab
// A has partners:
//   - X their ex!
//   - B their current partner
//
// extendedFamily:
//   - B has another child:
//     - bc (with parent C)
//   - X has another child:
//     - xy (with parent Y - relationshipType: null)
//
// Like so:
//
//   Y   X∙∙∙A---B   C
//    \ / \ /  |  \ /
//    xy  ax   ab  bc

export default function ExtendedFamilyA () {
  return State({
    view: {
      focus: 'A',
      extendedFamily: false
    },
    childLinks: {
      A: {
        ax: 'birth',
        ab: 'birth'
      },
      B: {
        ab: 'birth',
        bc: 'birth'
      },
      C: {
        bc: 'birth'
      },
      X: {
        ax: 'birth',
        xy: 'birth'
      },
      Y: {
        xy: 'birth'
      }
    },
    partnerLinks: {
      A: {
        B: 'partners',
        X: 'inferred'
      }
    }
  })
}
