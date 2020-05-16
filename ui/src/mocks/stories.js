import { personComplete } from './person-profile'
export const story1 = {
  id: '%Story1',
  type: '',
  title: 'Story 1',
  description: 'This is the description of story1',
  recordDate: '14 May 2020',
  recordEndDate: '14 May 2020',
  location: '',
  creator: '',
  submissionDate: '14 May 2020',
  contributionNotes: '',
  locationDescription: '',
  format: '',
  identifier: '',
  language: '',
  source: '',
  transcription: '',
  contributors: [
    personComplete.parents
  ],
  mentions: [
    ...personComplete.parents,
    ...personComplete.children,
    ...personComplete.siblings
  ],
  artefacts: [
  ]
}

export const story2 = {
  id: '%Story2',
  type: '',
  title: 'Story 2',
  description: 'This is the description of story2',
  recordDate: '14 May 2020',
  recordEndDate: '14 May 2020',
  location: '',
  creator: '',
  submissionDate: '14 May 2020',
  contributionNotes: '',
  locationDescription: '',
  format: '',
  identifier: '',
  language: '',
  source: '',
  transcription: '',
  contributors: [
    personComplete
  ],
  mentions: [
    ...personComplete.siblings
  ]
}

export const story3 = {
  id: '%Story3',
  type: '',
  title: 'Story 3 this is a really long story title about a really cool story',
  description: 'This is the description of story3',
  recordDate: '14 May 2020',
  recordEndDate: '14 May 2020',
  location: '',
  creator: '',
  submissionDate: '14 May 2020',
  contributionNotes: '',
  locationDescription: '',
  format: '',
  identifier: '',
  language: '',
  source: '',
  transcription: '',
  contributors: [
    ...personComplete.parents,
    ...personComplete.children,
    ...personComplete.siblings
  ],
  mentions: [
    ...personComplete.parents,
    ...personComplete.children,
    ...personComplete.siblings
  ]
}

export const STORIES = [
  story1,
  story2,
  story3
]
