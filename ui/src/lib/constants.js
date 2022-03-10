export const GENDERS = [
  'male',
  'female',
  'other',
  'unknown'
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
  aliveInterval: [
    // v => !!v || 'Date of birth is required'
  ],
  relationshipType: [
    // v => !!v || 'Relationship type is required'
  ],
  csvFile: [
    v => !!v || 'No CSV Uploaded'
  ]
}

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

export const DECEASED_COLOUR = '#bfbfbf' // TODO: is this the right place to put these?
// export const ALIVE_COLOUR = '#009999'
export const ALIVE_COLOUR = '#427979'

export const SORT = {
  default: 0,
  ascending: 1,
  descending: 2
}

// NOTE - these values must line up with the keys for translations!
// There is a test which checks this :)
export const ACCESS_PRIVATE = 'private'
export const ACCESS_ALL_MEMBERS = 'allMembers'
export const ACCESS_KAITIAKI = 'kaitiaki'

export const ACCESS_TYPES = [
  ACCESS_PRIVATE,
  ACCESS_ALL_MEMBERS,
  ACCESS_KAITIAKI
]

export const LINK_CHILD = 'child'
export const LINK_PARENT = 'parent'
export const LINK_PARTNER = 'partner'
