import * as csv from './csv'
const test = require('tape')

// NOTE: column names need to be on same line as opening of string literal

// missing "deceased" column
const A = `parentNumber,number,preferredName,legalName,gender,bornAt,diedAt,birthOrder,relationshipType,profession,phone,email,address,location
,1,Basia,Basia Adanez,female,,,,birth,Marketing Manager,1851844701,badanez0@yale.edu,2 Gateway Center,Philippines
1,2,Phelia,Phelia Curness,male,,,,adopted,Pharmacist,9481822794,pcurness1@irs.gov,52 Prentice Terrace,Chile
`
// person missing relationshipType
const B = `parentNumber,number,preferredName,legalName,gender,bornAt,diedAt,birthOrder,relationshipType,profession,phone,email,address,location
,1,Basia,Basia Adanez,female,,,,birth,Marketing Manager,1851844701,badanez0@yale.edu,2 Gateway Center,Philippines
1,2,Phelia,Phelia Curness,male,,,,,Pharmacist,9481822794,pcurness1@irs.gov,52 Prentice Terrace,Chile
`

test('csv.parse', t => {
  t.plan(3)

  csv.parse(A)
    .then(csv => {
      t.equal(csv.length, 2, 'loads 2 rows')
      t.deepEqual(
        csv[1],
        {
          parentNumber: '1', // TODO should be number?
          number: '2',
          preferredName: 'Phelia',
          legalName: 'Phelia Curness',
          gender: 'male',
          bornAt: '', // TODO should be undefined ?
          diedAt: '',
          birthOrder: '',
          phone: '9481822794',
          email: 'pcurness1@irs.gov',
          address: '52 Prentice Terrace',
          location: 'Chile',
          profession: 'Pharmacist',
          relationshipType: 'adopted',
          deceased: undefined // << adds one missing from cols
        },
        'loads correct content'
      )
    })
    .catch(err => {
      t.equal(err, undefined)
    })

  csv.parse(B)
    .then(csv => {
      t.deepEqual(csv[1].relationshipType, 'birth', 'missing relationshipType default to "birth"'
      )
    })
    .catch(err => {
      t.equal(err, undefined)
    })
})
