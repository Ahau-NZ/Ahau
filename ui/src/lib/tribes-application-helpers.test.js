import { findInvalidProfileProps, copyProfileInformation } from './tribes-application-helpers.js'
const test = require('tape')

test('invalid profile props (empty profile)', t => {
  t.plan(3)

  const emptyProfile = {
    preferredName: null,
    legalName: null,
    aliveInterval: null,
    address: null,
    city: null,
    country: null
  }

  t.deepEqual(
    findInvalidProfileProps(emptyProfile),
    [
      { prop: 'Preferred Name or Full Name' },
      { prop: 'Date of Birth' },
      { prop: 'City' },
      { prop: 'Country' }
    ]
  )

  // no names
  const profileEx1 = {
    preferredName: '',
    legalName: 'Cherese Putiputi Eriepa',
    aliveInterval: '2020-12-12/',
    address: '123 Place Road',
    city: 'My City',
    country: 'Cook Islands'
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

test('copy profile information', t => {
  const profile = {
    type: 'person',
    address: null,
    aliveInterval: '1954-02-02/',
    altNames: ['Cinda', 'Cinderelly'],
    authors: [{ feedId: '@authorFeedId' }],
    birthOrder: null,
    buriedLocation: null,
    canEdit: true,
    city: null,
    country: null,
    deceased: null,
    description: null,
    email: null,
    gender: 'female',
    id: '%zYx5uK9LwXapAcXSJNY/w31xSBk7TjXMQlwOmat4xPY=.sha256',
    legalName: 'Cinderella',
    phone: null,
    placeOfBirth: null,
    placeOfDeath: null,
    postCode: null,
    preferredName: 'Cindy',
    profession: null,
    recps: ['%4sufozI78qw1n9AfEwev4kvG3UrUtVjL/fsq0jHq2rA=.cloaked'],
    school: ['University'],
    education: [],
    tiaki: [{ id: '%tiakiId' }],
    avatarImage: {
      blob: '&L7wM/MlcwTda952COLim6oMLY3xXTQAbWmiXwZL/JxM=.sha256',
      mimeType: 'image/png',
      size: 460470,
      uri: 'http://localhost:28067/%2a952COLim6oMLY3xXTQ6L7wM%2FMlcwTdAbWmiXwZL%2FJxM%3D.sha256?unbox=ZPPuseLEHVXuBhjifoiamwaODX9mVBqyEoSYsw4Ky1A%3D.boxs'
    },
    headerImage: {
      blob: '&U8R5rtLuC4jyNNm+qKp2sDs+b/rE34ITdrkG3gkNTYQ=.sha256',
      width: null,
      mimeType: 'image/png',
      size: 294695,
      uri: 'http://localhost:28067/%26L7wM%2FMlcwTda952COLim6oMLY3xXTQAbWmiXwZL%2FJxM%3D.sha256?unbox=ZPPuseLEHVXuBhjifoiamwaODX9mVBqyEoSYsw4Ky1A%3D.boxs'
    }
  }

  const expectedCopy = {
    aliveInterval: '1954-02-02/',
    altNames: {
      add: ['Cinda', 'Cinderelly']
    },
    gender: 'female',
    legalName: 'Cinderella',
    preferredName: 'Cindy',
    school: ['University'],
    avatarImage: {
      blob: '&L7wM/MlcwTda952COLim6oMLY3xXTQAbWmiXwZL/JxM=.sha256',
      mimeType: 'image/png',
      size: 460470,
      unbox: 'ZPPuseLEHVXuBhjifoiamwaODX9mVBqyEoSYsw4Ky1A=.boxs'
    },
    headerImage: {
      blob: '&U8R5rtLuC4jyNNm+qKp2sDs+b/rE34ITdrkG3gkNTYQ=.sha256',
      mimeType: 'image/png',
      size: 294695,
      unbox: 'ZPPuseLEHVXuBhjifoiamwaODX9mVBqyEoSYsw4Ky1A=.boxs'
    }
  }

  t.deepEqual(
    copyProfileInformation(profile),
    expectedCopy,
    'copies profile as expected'
  )

  t.end()
})
