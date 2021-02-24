import { findInvalidProfileProps } from './tribes-application-helpers.js'
const test = require('tape')

test('invalid profile props (empty profile)', t => {
  t.plan(3)

  const emptyProfile = {
    preferredName: null,
    legalName: null,
    aliveInterval: null,
    address: null,
    location: null
  }

  t.deepEqual(
    findInvalidProfileProps(emptyProfile),
    [
      { prop: 'Preferred Name or Full Name' },
      { prop: 'Date of Birth' },
      { prop: 'Address' },
      { prop: 'City, Country' }
    ]
  )

  // no names
  const profileEx1 = {
    preferredName: '',
    legalName: 'Cherese Putiputi Eriepa',
    aliveInterval: '2020-12-12/',
    address: '123 Place Road',
    location: 'My City'
  }

  t.deepEqual(
    findInvalidProfileProps(profileEx1),
    []
  )

  profileEx1.preferredName = ''
  profileEx1.legalName = ''

  t.deepEqual(
    findInvalidProfileProps(profileEx1),
    [
      { prop: 'Preferred Name or Full Name' }
    ]
  )
})