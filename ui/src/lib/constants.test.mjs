import test from 'tape'
import { ACCESS_TYPES } from './constants.mjs'

import translations from '../translations/en_NZ/access-button.json' assert { type: 'json' }

test('ACCESS_TYPES (for AccessButton)', t => {
  t.plan(3)

  for (const translationKey of ACCESS_TYPES) {
    t.true(translations[translationKey], `${translationKey} has a valid translation`)
  }
})
