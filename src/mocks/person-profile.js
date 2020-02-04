export const personMinimum = {
  id: '%someProfileId',
  canEdit: false,
  preferredName: 'Will',
  legalName: 'Will Smith',
  bornAt: '1980-02-01',
  description: null,
  gender: 'male',
  avatarImage: null,
  headerImage: null
}

export const personEmpty = {
  id: '0',
  preferredName: null,
  legalName: null,
  bornAt: null,
  diedAt: null,
  description: null,
  gender: null,
  avatarImage: null,
  birthOrder: null,
  headerImage: null,
  children: null,
  siblings: null,
  parents: null,
  partners: null
}

export const personNoImages = {
  id: '0',
  preferredName: 'Kuia',
  legalName: 'Kuia',
  gender: 'female',
  bornAt: '1950-01-01',
  children: [
    {
      id: '1',
      preferredName: 'Wahine',
      gender: 'female',
      bornAt: '1980-01-01',
      children: [
        {
          id: '2',
          preferredName: 'Kotiro',
          legalName: 'Kotiro',
          gender: 'female',
          bornAt: '2008-01-01'
        },
        {
          id: '3',
          preferredName: 'Tama',
          legalName: 'Tama',
          gender: 'male',
          bornAt: '2008-01-01'
        }
      ]
    },
    {
      id: '4',
      preferredName: 'Tane',
      legalName: 'Tane',
      gender: 'male',
      bornAt: '1980-01-01'
    }
  ],
  partners: [
    {
      id: '5',
      preferredName: 'Koro',
      legalName: 'Koro',
      gender: 'male',
      bornAt: '1950-01-01'
    }
  ]
}

export const personComplete = {
  'id': '%A',
  'gender': 'male',
  'legalName': 'Will Smith',
  'bornAt': '2003-02-01',
  'preferredName': 'Will',
  'relationshipType': 'birth',
  'altNames': ['Willard', 'William'],
  'avatarImage': {
    uri: 'https://m.media-amazon.com/images/M/MV5BNTczMzk1MjU1MV5BMl5BanBnXkFtZTcwNDk2MzAyMg@@._V1_UY317_CR2,0,214,317_AL_.jpg'
  },
  description: 'Willard Carroll Smith Jr. is an American actor and rapper. In April 2007, Newsweek called him "the most powerful actor in Hollywood". Smith has been nominated for five Golden Globe Awards and two Academy Awards, and has won four Grammy Awards.',
  'children': [
    {
      'id': '%B',
      'gender': 'male',
      'legalName': 'Jaden Smith',
      'preferredName': 'Jaden',
      'avatarImage': {
        uri: 'http://www.gstatic.com/tv/thumb/persons/276691/276691_v9_bb.jpg'
      }
    },
    {
      'id': '%C',
      'gender': 'male',
      'legalName': 'Trey Smith',
      'preferredName': 'Trey',
      'avatarImage': {
        'uri': 'http://www.gstatic.com/tv/thumb/persons/276690/276690_v9_ba.jpg'
      }
    },
    {
      'id': '%D',
      'gender': 'female',
      'legalName': 'Willow Smith',
      'preferredName': 'Willow ',
      'avatarImage': {
        'uri': 'http://www.gstatic.com/tv/thumb/persons/512549/512549_v9_bb.jpg'
      }
    }
  ],
  'parents': [
    {
      'id': '%E',
      'gender': 'male',
      'legalName': 'Willard Smith',
      'preferredName': 'Willard',
      'avatarImage': {
        uri: 'https://i.dailymail.co.uk/i/pix/2016/11/08/08/3A2ADC9F00000578-3915844-image-a-6_1478592069599.jpg'
      }
    },
    {
      'id': '%F',
      'gender': 'female',
      'legalName': 'Caroline Bright',
      'preferredName': 'Caroline',
      'bornAt': '1950-01-01',
      'avatarImage': {
        uri: ''
      }
    }
  ],
  siblings: [
    {
      'id': '%F',
      'gender': 'female',
      'legalName': 'Pam Smith',
      'preferredName': 'Pam',
      'avatarImage': {
        uri: 'https://m.media-amazon.com/images/M/MV5BMjE2NzI5NTExMl5BMl5BanBnXkFtZTcwMzg1ODQ0Nw@@._V1_SY1000_CR0,0,666,1000_AL_.jpg'
      }
    },
    {
      'id': '%G',
      'gender': 'female',
      'legalName': 'Ellen Smith',
      'preferredName': 'Ellen',
      'avatarImage': {
        uri: 'https://starschanges.com/wp-content/uploads/2016/07/will-smith-siblings-sister-ellen-smith.jpg'
      }
    },
    {
      'id': '%H',
      'gender': 'male',
      'legalName': 'Harry Smith',
      'preferredName': 'Harry',
      'avatarImage': {
        uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP7dGvJL3cPmEqXC5JtqPHV6b1gL2wzLaQf1eDTdkFZbpTPoD2&s'
      }
    }
  ]
}
