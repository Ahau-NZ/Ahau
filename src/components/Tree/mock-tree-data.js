export default {
  // my family data -> Claudine is the mother of 5 children, and one of them has a child 'Otene'
  // title: 'Ms',
  gender: 'female',
  preferredName: 'Bubz',
  legalName: 'Claudine Anita Eriepa',
  // dateOfBirth: '1970-07-19',
  // dateOfDeath: '',
  children: [
    {
      // title: 'Mrs',
      gender: 'female',
      preferredName: 'Zara',
      legalName: 'Zara Aria Davis',
      // dateOfBirth: '1994-06-08',
      // dateOfDeath: '',
      relationshipType: 'birth',
      legallyAdopted: null,
      children: [
        {
          // title: 'Mr',
          gender: 'male',
          preferredName: 'Otene',
          legalName: 'Otene Pirika Henare Davis',
          // dateOfBirth: '2019-07-08',
          // dateOfDeath: '',
          relationshipType: 'whangai',
          legallyAdopted: true,
          children: []
        }
      ]
    },
    {
      // title: 'Miss',
      gender: 'female',
      preferredName: 'Cherese',
      legalName: 'Cherese Putiputi Eriepa',
      // dateOfBirth: '1995-07-24',
      // dateOfDeath: '',
      relationshipType: 'birth',
      legallyAdopted: null,
      children: []
    },
    {
      // title: 'Miss',
      gender: 'female',
      preferredName: 'Daynah',
      legalName: 'Daynah Anahera Eriepa',
      // dateOfBirth: '1995-07-24',
      // dateOfDeath: '',
      relationshipType: 'birth',
      legallyAdopted: null,
      children: []
    },
    {
      // title: 'Miss',
      gender: 'female',
      preferredName: 'Peaches',
      legalName: 'Pititi Kimiel Eriepa',
      // dateOfBirth: '1999-10-20',
      // dateOfDeath: '',
      relationshipType: 'adopted',
      legallyAdopted: true,
      children: []
    },
    {
      // title: 'Mr',
      gender: 'male',
      preferredName: 'Dude',
      legalName: 'Damon Manaia Deisher',
      // dateOfBirth: '2000-12-19',
      // dateOfDeath: '',
      relationshipType: null,
      legallyAdopted: null,
      children: []
    }
  ]
}
