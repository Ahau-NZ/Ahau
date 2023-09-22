import test from 'tape'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import { ACCESS_TYPES } from './constants.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const translations = JSON.parse(
  readFileSync(join(__dirname, '../translations/en_NZ/access-button.json'))
)

test('ACCESS_TYPES (for AccessButton)', t => {
  t.plan(3)

  for (const translationKey of ACCESS_TYPES) {
    t.true(translations[translationKey], `${translationKey} has a valid translation`)
  }
})
