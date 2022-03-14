import { State } from '../lib/test-helpers'

/* whangai to grandparent

                           ∇
              Grandad─┬─Grandma
                 ┌────┴╌╌╌╌╌┐
                 │          ┆
   Husband─┬─Daughter    (whangai)
           │                ┆
      Grandaughter╌╌╌╌╌╌╌╌╌╌┘

*/

export default function WhangaiGrandparentComplex () {
  return State({
    view: {
      focus: 'Grandma',
      importantRelationships: {
        Grandaughter: {
          profileId: 'Grandaughter',
          primary: { profileId: 'Grandma' }
        }
      }
    },
    childLinks: {
      Grandma: {
        Daughter: 'birth',
        Grandaughter: 'whangai'
      },
      Daughter: {
        Grandaughter: 'birth'
      },

      Grandad: {
        Daughter: 'birth',
        Grandaughter: 'whangai'
      },
      Husband: {
        Grandaughter: 'birth'
      }
    },
    partnerLinks: {
      Grandad: {
        Grandma: 'partners'
      },
      Daughter: {
        Husband: 'partners'
      }
    }
  })
}
