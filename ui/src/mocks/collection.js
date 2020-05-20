import { personComplete } from './person-profile'

export const collectionComplete = {
  image: { uri: 'https://www.nme.com/wp-content/uploads/2020/04/will-smith.jpg' },
  title: 'Acting',
  description: 'These are things to do with acting.',
  stories: ['%storyid1', '%storyid2', '%storyid3', '%storyid4'],
  lastSubmissionDate: new Date(),
  hasAccess: [
    personComplete,
    ...personComplete.children
  ]
}

export const collectionMinimum = {
  image: {},
  title: 'Minimum Collection',
  description: 'My minimum collection',
  stories: [],
  lastSubmissionDate: new Date(),
  hasAccess: [
  ]
}

export const longDescription = {
  image: {},
  title: 'Long description',
  description: 'This is going to be a really long, well actually not that long. But enought to overflow the chip components. It should truncate the text',
  stories: [],
  lastSubmissionDate: new Date(),
  hasAccess: [
  ]
}

export const longTitle = {
  image: {},
  title: 'Title for my collection which is going to be really long. Lets see what it looks like.',
  description: 'my long titled collection',
  stories: [],
  lastSubmissionDate: new Date(),
  hasAccess: [
  ]
}

export const COLLECTIONS = [
  collectionComplete,
  collectionMinimum,
  longTitle,
  longDescription
]
