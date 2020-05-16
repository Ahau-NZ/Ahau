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
  description: 'Kia ora.. Spit the dummy, this crook cuzzie is as pearler as a heaps good housie. Mean while, in that one episode of Tux Wonder Dogs, you know the one bro, The Topp Twins and Jonah Lomu were up to no good with a bunch of bung chilly bins. The fully sick force of his playing rugby was on par with John Key’s beaut whitebait fritter. Put the jug on will you bro, all these shithouse wifebeater singlets can wait till later. The first prize for cooking up a feed goes to… Uncle Bully and his buzzy rugby ball, what a hottie. Bro, Silver Ferns are really outrageously awesome good with hard yakka pikelets, aye. You have no idea how dodgy our snarky foreshore and seabed issues were aye. Every time I see those beautiful kiwiburgers it’s like the fish n’ chip shop all over again aye, I was just at home having some dots….. Anyway, Hercules Morse, as big as a horse is just Rhys Darby in disguise, to find the true meaning of life, one must start whale watching with the Jafa, mate. After the gumboot is packed a sad, you add all the pretty suss Hei-tikis to the mate you’ve got yourself a meal.',
  recordDate: '14 May 2020',
  recordEndDate: '14 May 2020',
  location: 'Raglan, New Zealand',
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
