import { ACCESS_TYPES } from './constants.js'

const test = require('tape')
const translations = require('../translations/en_NZ').accessButton

test('ACCESS_TYPES (for AccessButton)', t => {
  t.plan(3)

  for (const translationKey of ACCESS_TYPES) {
    t.true(translations[translationKey], `${translationKey} has a valid translation`)
  }
})
