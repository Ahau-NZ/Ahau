import { personComplete } from './person-profile'
import { COLLECTIONS } from './collection'

const family = [
  personComplete,
  ...personComplete.children,
  ...personComplete.parents,
  ...personComplete.siblings
]

export const story1 = {
  id: '%Story1',
  type: '',
  title: 'Story 1',
  description: 'This is the description of story1',
  startDate: '14 May 2020',
  endDate: '14 May 2020',
  location: '',
  locationDescription: '',
  creator: {},
  submissionDate: '14 May 2020',
  contributionNotes: '',

  format: '',
  identifier: '',
  source: '',
  language: '',
  translation: '',
  culturalNarrative: '',

  mentions: family,
  categories: ['category1', 'category2'],
  collections: COLLECTIONS,
  access: family,
  contributors: family,
  protocols: [],
  relatedRecords: COLLECTIONS,
  artefacts: []
}

export const STORIES = [
  story1
]
