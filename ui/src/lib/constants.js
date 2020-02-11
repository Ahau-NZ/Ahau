export const GENDERS = [
  'male',
  'female'
  // 'other', // disabled for now
  // 'unknown' // disabled for now
]
export const RELATIONSHIPS = [
  'birth',
  'whangai',
  'adopted'
  // 'unknown'
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
    ],
    whakapapaView: [
      v => !!v || 'Name is required',
      v => (v && v.length <= 50) || 'Name must be less than 50 characters'
    ]
  },
  bornAt: [
    // v => !!v || 'Date of birth is required'
  ],
  relationshipType: [
    // v => !!v || 'Relationship type is required'
  ]
}

export const PERMITTED_PROFILE_ATTRS = [
  // these are the properties that changes are permitted on
  'gender',
  'legalName',
  'bornAt',
  'diedAt',
  'preferredName',
  'avatarImage',
  'description',
  'headerImage',
  'altNames',
  'birthOrder'
  // 'relationshipType'
]

export const DECEASED_COLOUR = '#bfbfbf' // TODO: is this the right place to put these?
export const ALIVE_COLOUR = '#009999'
