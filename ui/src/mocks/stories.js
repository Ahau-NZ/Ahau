import { personComplete } from './person-profile'
import { artefacts } from './artefacts'
import { collectionComplete, collectionMinimum } from './collections'

export const story1 = {
  id: '%Story1',
  type: '',
  title: 'Story 1',
  description: 'This is the description of story1',
  recordDate: '14 May 2020',
  recordEndDate: '20 May 2020',
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
  contributors: [...personComplete.parents],
  mentions: [
    ...personComplete.parents,
    ...personComplete.children,
    ...personComplete.siblings
  ],
  artefacts: [...artefacts],
  collections: [],
  access: [...personComplete.parents],
  categories: [],
  relatedRecords: [],
  protocols: []

}

export const story2 = {
  id: '%Story2',
  type: 'story',
  title: 'testing porposes',
  description: 'This is the description of story2',
  recordDate: '14 May 2020',
  recordEndDate: '',
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
  mentions: [...personComplete.siblings],
  artefacts: [artefacts[2]],
  collections: [],
  access: [...personComplete.parents],
  categories: [],
  relatedRecords: [],
  protocols: []
}

export const story3 = {
  id: '%Story3',
  type: 'story',
  title: 'Story 3 this is a really long story title about a really cool story',
  description: 'Kia ora.. Spit the dummy, this crook cuzzie is as pearler as a heaps good housie. Mean while, in that one episode of Tux Wonder Dogs, you know the one bro, The Topp Twins and Jonah Lomu were up to no good with a bunch of bung chilly bins. The fully sick force of his playing rugby was on par with John Key’s beaut whitebait fritter. Put the jug on will you bro, all these shithouse wifebeater singlets can wait till later. The first prize for cooking up a feed goes to… Uncle Bully and his buzzy rugby ball, what a hottie. Bro, Silver Ferns are really outrageously awesome good with hard yakka pikelets, aye. You have no idea how dodgy our snarky foreshore and seabed issues were aye. Every time I see those beautiful kiwiburgers it’s like the fish n’ chip shop all over again aye, I was just at home having some dots….. Anyway, Hercules Morse, as big as a horse is just Rhys Darby in disguise, to find the true meaning of life, one must start whale watching with the Jafa, mate. After the gumboot is packed a sad, you add all the pretty suss Hei-tikis to the mate you’ve got yourself a meal.',
  recordDate: '14 May 2020',
  recordEndDate: '14 May 2020',
  location: 'Raglan, New Zealand',
  creator: personComplete.parents[0],
  submissionDate: '14 May 2020',
  contributionNotes: '',
  locationDescription: '',
  format: '',
  identifier: '',
  language: '',
  source: '',
  transcription: '',
  contributors: [
    ...personComplete.siblings
  ],
  mentions: [
    ...personComplete.siblings
  ],
  artefacts: [],
  collections: [],
  access: [personComplete.parents],
  categories: [],
  relatedRecords: [],
  protocols: []
}

export const story4 = {
  id: '%Story3',
  type: 'story',
  title: 'Whanau land succession application ',
  description: 'Here are the files that Ngāti have submitted to the land courts for consideration for Onehunga block. This application was completed by Sara Tairea on behalf of the hapū. The application was approved by hapū trustees ',
  recordDate: '14 May 2020',
  recordEndDate: '14 May 2020',
  location: 'Raglan, New Zealand',
  creator: personComplete.parents[0],
  submissionDate: '14 May 2020',
  contributionNotes: 'This information has been made available for all our Ngāti Nūrou members but does not directly effect all whānau. This application is on behalf of the Tairea whānau and the descendats of Auru and Ngametua Tairea. For further information regarding this applicaion or the information provided in the record please feel free to contact Sara or myself directly.',
  locationDescription: 'This application is in regard to the succession of the Onehunga block in Mauke by children and descendants of Auru and Ngametua Tairea. This land block has a number of significant sites including the burial site for Tairea and ',
  culturalNarrative: 'This application is in regard to the succession of the Onehunga block in Mauke by children and descendants of Auru and Ngametua Tairea. This land block has a number of significant sites including the burial site for Tairea and ',
  format: 'photos taken from the land block and digital copies of documents from the meetings and applications',
  identifier: 'Ref#1000',
  language: 'English',
  source: 'Hapū administration',
  transcription: '',
  contributors: [
    ...personComplete.parents
  ],
  mentions: [
    ...personComplete.parents,
    ...personComplete.children,
    ...personComplete.siblings
  ],
  artefacts: [
    artefacts[4],
    artefacts[2],
    artefacts[3]
  ],
  collections: [
    collectionComplete,
    collectionMinimum
  ],
  access: [
    ...personComplete.parents
  ],
  categories: [
    story1, story2, story1, story2
  ],
  relatedRecords: [
    story1, story2
  ],
  protocols: [
    ...personComplete.parents
  ]

}

export const STORIES = [
  story1,
  story2,
  story3,
  story4
]
