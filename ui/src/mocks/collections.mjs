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
    id: '1',
    image: { uri: import('@/assets/mocks/mock3.jpg') },
    title: '1',
    description: 'Private records that I want to remember',
    stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
    lastSubmissionDate: new Date(),
    hasAccess: [{
      id: 123,
      preferredName: 'Ian'
      // avatarImage: import('@/assets/koro.svg')
    },
    {
      id: 456,
      preferredName: 'Ben'
      // avatarImage: import('@/assets/kuia.svg')
    }
    ]
  },
  {
    id: '2',
    image: { uri: import('@/assets/mocks/mock3.jpg') },
    title: '2',
    description: 'Private records that I want to remember',
    stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
    lastSubmissionDate: new Date(),
    hasAccess: [{
      id: 123,
      preferredName: 'Ian'
      // avatarImage: import('@/assets/koro.svg')
    },
    {
      id: 456,
      preferredName: 'Ben'
      // avatarImage: import('@/assets/kuia.svg')
    }]
  },
  {
    id: '3',
    image: { uri: import('@/assets/mocks/mock3.jpg') },
    title: '3',
    description: 'Private records that I want to remember',
    stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
    lastSubmissionDate: new Date(),
    hasAccess: [{
      id: 123,
      preferredName: 'Ian',
      avatarImage: { uri: import('@/assets/koro.svg') }
    },
    {
      id: 456,
      preferredName: 'Ben',
      avatarImage: { uri: import('@/assets/kuia.svg') }
    }]
  },
  {
    id: '4',
    image: { uri: import('@/assets/mocks/mock3.jpg') },
    title: '4',
    description: 'Private records that I want to remember',
    stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
    lastSubmissionDate: new Date(),
    hasAccess: [{
      id: 123,
      preferredName: 'Ian',
      avatarImage: { uri: import('@/assets/koro.svg') }
    },
    {
      id: 456,
      preferredName: 'Ben',
      avatarImage: { uri: import('@/assets/kuia.svg') }
    }]
  },
  {
    id: '5',
    image: { uri: import('@/assets/mocks/mock3.jpg') },
    title: '5',
    description: 'Private records that I want to remember',
    stories: ['storyid9', 'storyid10', 'storyid11', 'storyid12'],
    lastSubmissionDate: new Date(),
    hasAccess: [{
      id: 123,
      preferredName: 'Ian',
      avatarImage: { uri: import('@/assets/koro.svg') }
    },
    {
      id: 456,
      preferredName: 'Ben',
      avatarImage: { uri: import('@/assets/kuia.svg') }
    }]
  }
]

export const mockCollections = {
  collectionComplete,
  collectionMinimum
}
