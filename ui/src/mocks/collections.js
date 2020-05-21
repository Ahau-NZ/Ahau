import { personComplete } from './person-profile'

export const collectionComplete = {
  image: 'https://www.nme.com/wp-content/uploads/2020/04/will-smith.jpg',
  title: 'Acting',
  description: 'These are things to do with acting',
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

export const firstMocks = [
  {
    image: require('@/assets/mocks/mock3.jpg'),
    title: 'Private Records',
    description: 'Private records that I want to remember',
    stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
    lastSubmissionDate: new Date(),
    hasAccess: [{
      id: 123,
      preferredName: 'Ian'
      // avatarImage: require('@/assets/koro.svg')
    },
    {
      id: 456,
      preferredName: 'Ben'
      // avatarImage: require('@/assets/kuia.svg')
    }
    ]
  },
  {
    image: require('@/assets/mocks/mock3.jpg'),
    title: 'Private Records',
    description: 'Private records that I want to remember',
    stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
    lastSubmissionDate: new Date(),
    hasAccess: [{
      id: 123,
      preferredName: 'Ian'
      // avatarImage: require('@/assets/koro.svg')
    },
    {
      id: 456,
      preferredName: 'Ben'
      // avatarImage: require('@/assets/kuia.svg')
    }]
  },
  {
    image: require('@/assets/mocks/mock3.jpg'),
    title: 'Private Records',
    description: 'Private records that I want to remember',
    stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
    lastSubmissionDate: new Date(),
    hasAccess: [{
      id: 123,
      preferredName: 'Ian',
      avatarImage: { uri: require('@/assets/koro.svg') }
    },
    {
      id: 456,
      preferredName: 'Ben',
      avatarImage: { uri: require('@/assets/kuia.svg') }
    }]
  },
  {
    image: require('@/assets/mocks/mock3.jpg'),
    title: 'Private Records',
    description: 'Private records that I want to remember',
    stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
    lastSubmissionDate: new Date(),
    hasAccess: [{
      id: 123,
      preferredName: 'Ian',
      avatarImage: { uri: require('@/assets/koro.svg') }
    },
    {
      id: 456,
      preferredName: 'Ben',
      avatarImage: { uri: require('@/assets/kuia.svg') }
    }]
  },
  {
    image: require('@/assets/mocks/mock3.jpg'),
    title: 'Private Records',
    description: 'Private records that I want to remember',
    stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
    lastSubmissionDate: new Date(),
    hasAccess: [{
      id: 123,
      preferredName: 'Ian',
      avatarImage: { uri: require('@/assets/koro.svg') }
    },
    {
      id: 456,
      preferredName: 'Ben',
      avatarImage: { uri: require('@/assets/kuia.svg') }
    }]
  }
]

export const mockCollections = {
  collectionComplete,
  collectionMinimum
}
