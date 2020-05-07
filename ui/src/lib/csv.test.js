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

test('csv.schema', t => {
  // cherese's schema tests:

  function isValid (prop) {
    return function (value) {
      if (!csv.schema[prop]) throw new Error('missing schema property:' + prop)
      return csv.schema[prop].action(value)
    }
  }

  // NUMBER

  // allowed
  t.true(isValid('number')(12), 'number can be number')
  // not allowed
  t.false(isValid('number')(null), 'number cannot be null')
  t.false(isValid('number')(undefined), 'number cannot be undefined')
  t.false(isValid('number')(''), 'number cannot be ""')
  t.false(isValid('number')('dog'), 'number cannot be string')

  // PARENT NUMBER

  // allowed
  t.true(isValid('parentNumber')(11), 'parentNumber can be a number')
  t.true(isValid('parentNumber')(''), 'parentNumber can be a empty string')
  t.true(isValid('parentNumber')(null), 'parentNumber can be a null')
  // not allowed
  t.false(isValid('parentNumber')('meow'), 'parentNumber cannot be a string')
  // t.false(isValid('parentNumber')('11'), 'parentNumber cannot be a stringy number')

  // GENDER

  // allowed
  t.true(isValid('gender')('male'), 'gender can be a male')
  t.true(isValid('gender')('female'), 'gender can be a female')
  t.true(isValid('gender')(''), 'gender can be a ""')
  t.true(isValid('gender')(null), 'gender can be a null')
  // not allowed
  t.false(isValid('gender')('meow'), 'parentNumber cannot be any string')
  t.false(isValid('gender')(12), 'parentNumber cannot be number')

  // BORN AT

  // allowed
  // TODO this is a poor format for dates - should be YYYY/MM/DD
  t.true(isValid('bornAt')('21/04/2018'), 'bornAt can be DD/MM/YYYY')
  t.true(isValid('bornAt')('21-04-2018'), 'bornAt can be DD-MM-YYYY')
  t.true(isValid('bornAt')(''), 'bornAt can be empty')
  t.true(isValid('bornAt')(null), 'bornAt can be null')
  // not allowed
  t.false(isValid('bornAt')('04-21-2018'), 'bornAt cannot be MM-DD-YYYY') // american style
  t.false(isValid('bornAt')('04/21/2018'), 'bornAt cannot be MM/DD/YYYY') // american style
  t.false(isValid('bornAt')('meow'), 'bornAt cannot be any string')
  t.false(isValid('bornAt')(12), 'bornAt cannot be number')

  // DIED AT

  // allowed
  // TODO this is a poor format for dates - should be YYYY/MM/DD
  t.true(isValid('diedAt')('21/04/2018'), 'diedAt can be DD/MM/YYYY')
  t.true(isValid('diedAt')('21-04-2018'), 'diedAt can be DD-MM-YYYY')
  t.true(isValid('diedAt')(''), 'diedAt can be empty')
  t.true(isValid('diedAt')(null), 'diedAt can be null')
  // not allowed
  t.false(isValid('diedAt')('04-21-2018'), 'diedAt cannot be MM-DD-YYYY') // american style
  t.false(isValid('diedAt')('04/21/2018'), 'diedAt cannot be MM/DD/YYYY') // american style
  t.false(isValid('diedAt')('meow'), 'diedAt cannot be any string')
  t.false(isValid('diedAt')(12), 'diedAt cannot be number')

  // BIRTH ORDER

  // allowed
  t.true(isValid('birthOrder')(1), 'birthOrder can be a number')
  t.true(isValid('birthOrder')(''), 'birthOrder can be empty')
  t.true(isValid('birthOrder')(null), 'birthOrder can be null')
  // not allowed
  t.false(isValid('birthOrder')('s'), 'birthOrder cannot be string')
  t.false(isValid('birthOrder')(-1), 'birthOrder cannot be negative')
  t.false(isValid('birthOrder')(1.5), 'birthOrder must be integer')

  // RELATIONSHIP TYPE

  // allowed
  t.true(isValid('relationshipType')('birth'), 'relationshipType can be birth')
  t.true(isValid('relationshipType')('whangai'), 'relationshipType can be whangai')
  t.true(isValid('relationshipType')('adopted'), 'relationshipType can be adopted')
  t.true(isValid('relationshipType')(''), 'relationshipType can be empty string')
  t.true(isValid('relationshipType')(null), 'relationshipType can be null')
  // not allowed
  t.false(isValid('relationshipType')('asd'), 'relationshipType cant be any string')
  t.false(isValid('relationshipType')(1234), 'relationshipType cant be a number')

  // EMAIL

  // allowed NOTE: allows wide range of emails not tested here
  t.true(isValid('email')('person@email.com'), 'email can contain @ and com')
  t.true(isValid('email')('person@email.co.nz'), 'email can contain @ and co.nz')
  t.true(isValid('email')('person@email.io'), 'email can contain @ and io')
  t.true(isValid('email')('person.last@email.io'), 'email can contain first.name')
  // t.true(isValid('email')('person.last+stuff@email.io'), 'email can contain +')
  // not allowed
  t.false(isValid('email')('person@email'), 'email needs domain name extension')
  t.false(isValid('email')('person.email.co.nz'), 'email needs @ symbol')

  // String Properties - no validation needed for these
  t.true(isValid('preferredName')('Cherese Eriepa'), 'preferredName can be a string')
  t.true(isValid('preferredName')(''), 'preferredName can be ""')
  // not allowed
  t.false(isValid('preferredName')(123), 'preferredName cant be a number')

  t.end()
})
