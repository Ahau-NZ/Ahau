export const GENDERS = [
  'male',
  'female'
  // 'other', // disabled for now
  // 'unknown' // disabled for now
]
export const RELATIONSHIPS = [
  'birth',
  'whangai',
  'adopted',
  'unknown'
]
// export const TITLES = [
//   'mr',
//   'mrs',
//   'ms',
//   'miss',
//   'other'
// ]

export const RULES = {
  title: [
    // v => !!v || 'Title is required'
  ],
  gender: [
    // v => !!v || 'Gender is required'
  ],
  name: {
    preferred: [
      // v => !!v || 'Preferred name is required',
      // v => (v && v.length <= 20) || 'Name must be less than 20 characters'
    ],
    legal: [
      // v => !!v || 'Legal name is required',
      // v => (v && v.length <= 50) || 'Name must be less than 50 characters'
    ]
  },
  date: {
    birth: [
      // v => !!v || 'Date of birth is required'
    ]
  },
  relationshipType: [
    // v => !!v || 'Relationship type is required'
  ]
}

export const PERMITTED_PROFILE_ATTRS = [ // these are the properties that changes are permitted on
  'gender',
  'legalName',
  'bornAt',
  'diedAt',
  'preferredName',
  'avatarImage',
  'description',
  'headerImage'
]
