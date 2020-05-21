import { personComplete } from './person-profile'
import { COLLECTIONS } from './collection'
import { ARTEFACTS } from './artefacts'
import clone from 'lodash.clonedeep'

const family = [
  clone(personComplete),
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
  creator: clone(personComplete),
  submissionDate: '14 May 2020',
  contributionNotes: '',

  format: '',
  identifier: '',
  source: '',
  language: '',
  translation: '',
  culturalNarrative: '',

  mentions: clone(family),
  categories: ['category1', 'category2'],
  collections: clone(COLLECTIONS),
  access: clone(family),
  contributors: clone(family),
  protocols: [],
  relatedRecords: clone(COLLECTIONS),
  artefacts: clone(ARTEFACTS)
}

export const STORIES = [
  story1
]
