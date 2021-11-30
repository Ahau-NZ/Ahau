import { ACCESS_TYPES } from './constants.js'

const test = require('tape')
const translations = require('../translations/en').accessButton

test('ACCESS_TYPES (for AccessButton)', t => {
  t.plan(3)

  for (const [CONST, translationKey] of Object.entries(ACCESS_TYPES)) {
    t.true(translations[translationKey], `${CONST} has a valid translation`)
  }
})
