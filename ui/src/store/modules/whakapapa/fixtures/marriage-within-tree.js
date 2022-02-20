import { State } from '../lib/test-helpers'

/* marriage within tree

              Grandad─┬─Grandma
                 ┌────┴╌╌╌╌╌┐
                 │          ┆
             Daughter─┬───(Son)
                      │
                 Grandaughter

*/

// with this importantRelationship we expext the Son to be drawn as a partner of the Daughter
// and a secondary link to run from the son to the Grandma + Grandad

export default function MarriageWithinTree () {
  return State({
    view: {
      focus: 'Grandma',
      extendedFamily: false,
      importantRelationships: {
        Son: {
          profileId: 'Son',
          primary: { profileId: 'Daughter' }
        }
      }
    },
    childLinks: {
      Grandma: {
        Daughter: 'birth',
        Son: 'whangai'
      },
      Grandad: {
        Daughter: 'birth',
        Son: 'whangai'
      },

      Daughter: {
        Grandaughter: 'birth'
      },
      Son: {
        Grandaughter: 'birth'
      }
    },
    partnerLinks: {
      Grandad: {
        Grandma: 'partners'
      },
      Daughter: {
        Son: 'partners'
      }
    }
  })
}
