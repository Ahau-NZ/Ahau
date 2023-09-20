import test from 'tape'
import { parseCustomFieldValue } from './csv.mjs'

test('parse custom field value date', t => {
  t.plan(3)

  const customFieldDef = {
    type: 'date'
  }

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, '19-09-2022'),
    '2022-09-19',
    'parses valid date'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, 'dog'),
    null,
    'parses invalid date'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, '19-09-202E'),
    null,
    'parses malformed date'
  )
})

test('parse custom field value number', t => {
  t.plan(4)

  const customFieldDef = {
    type: 'number'
  }

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, ''),
    null,
    'parses empty string'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, '1'),
    1,
    'parses valid number string'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, 1),
    1,
    'parses valid number'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, 'dog'),
    null,
    'parses invalid number'
  )
})

test('parse custom field value checkbox', t => {
  t.plan(8)

  const customFieldDef = {
    type: 'checkbox'
  }

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, ''),
    null,
    'parses empty string'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, null),
    null,
    'parses null'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, true),
    true,
    'parses boolean true'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, false),
    false,
    'parses boolean false'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, 'true'),
    true,
    'parses string true'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, 'false'),
    false,
    'parses string false'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, 'yes'),
    true,
    'parses string yes'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, 'no'),
    false,
    'parses string no'
  )
})

test('parse custom field value array', t => {
  t.plan(4)

  const customFieldDef = {
    type: 'array'
  }

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, ''),
    [],
    'parses empty string'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, 'Manawa'),
    ['Manawa'],
    'parses valid string to array'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, 'Manawa,baby,cookie'),
    ['Manawa', 'baby', 'cookie'],
    'splits string into array ","'
  )

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, 'Manawa, baby, cookie'),
    ['Manawa', 'baby', 'cookie'],
    'splits string into array ", "'
  )
})

test('parse custom field value list (multiple=false)', t => {
  t.plan(4)

  const customFieldDef = {
    type: 'list',
    multiple: false,
    label: 'Age group',
    options: [
      '0-12',
      '13-18',
      '19-24',
      '25-30',
      '31-40',
      '41-64',
      '65+'
    ]
  }

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, ''),
    [],
    'parses empty string'
  )

  // test when a string is given
  t.deepEqual(
    parseCustomFieldValue(customFieldDef, '25-30'),
    ['25-30'],
    'parses valid string found in the list of options'
  )

  // here i have set it to drop any invalid values that arent in
  // the list
  t.deepEqual(
    parseCustomFieldValue(customFieldDef, 'dog'),
    [],
    'parses invalid string thats not in the list of options'
  )

  customFieldDef.options = []
  t.deepEqual(
    parseCustomFieldValue(customFieldDef, '25-30'),
    [],
    'parses empty options'
  )
})

test('parse custom field value list (multiple=true)', t => {
  t.plan(7)

  const customFieldDef = {
    type: 'list',
    multiple: true,
    label: 'Age group',
    options: [
      '0-12',
      '13-18',
      '19-24',
      '25-30',
      '31-40',
      '41-64',
      '65+'
    ]
  }

  t.deepEqual(
    parseCustomFieldValue(customFieldDef, ''),
    [],
    'parses empty string'
  )

  // test when a string is given
  t.deepEqual(
    parseCustomFieldValue(customFieldDef, '25-30'),
    ['25-30'],
    'parses valid string found in the list of options'
  )

  // here i have set it to drop any invalid values that arent in
  // the list
  t.deepEqual(
    parseCustomFieldValue(customFieldDef, 'dog'),
    [],
    'parses invalid string thats not in the list of options'
  )

  // test when two values are given!
  // it will take the first value by default
  t.deepEqual(
    parseCustomFieldValue(customFieldDef, '25-30,41-64'),
    ['25-30', '41-64'],
    'parses valid string array to list array ","'
  )

  // test when two values are given with split like ', '
  // it will take the first value by default
  t.deepEqual(
    parseCustomFieldValue(customFieldDef, '25-30, 41-64'),
    ['25-30', '41-64'],
    'parses valid string array to list array ", "'
  )

  // test when two values are given and only one is invalid
  t.deepEqual(
    parseCustomFieldValue(customFieldDef, '25-30, 41-66'),
    ['25-30'],
    'parses string containing valid and invalid values'
  )

  customFieldDef.options = []
  t.deepEqual(
    parseCustomFieldValue(customFieldDef, '25-30'),
    [],
    'parses empty options'
  )
})
