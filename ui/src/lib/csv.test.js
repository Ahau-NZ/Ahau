import * as csv from './csv'
const test = require('tape')
const fs = require('fs').promises
const path = require('path')
const d3 = require('d3')

// NOTE: column names need to be on same line as opening of string literal

// for columns
const ALL_COLUMNS = 'parentNumber,number,preferredName,legalName,gender,relationshipType,birthOrder,bornAt,deceased,diedAt,phone,email,address,location,profession'
const MISSING_COLUMNS = 'parentNumber,number,legalName,gender,relationshipType,bornAt,deceased,diedAt,phone,address,location'
const EXTRA_COLUMNS = `${ALL_COLUMNS},extra1,extra2
`
const MISPELLED_COLUMNS = 'parentNumbe,number,preferredName,legalName,gender,relationshipType,birthOrder,bornAt,deceased,diedAt,phone,email,address,location,profession'

// for numbers
const DUPLICATE_NUMBERS = `${ALL_COLUMNS}
,1,,,,,,,,,,,,,
,1,,,,,,,,,,,,,
`

const VALID_NUMBERS = `${ALL_COLUMNS}
,1,,,,,,,,,,,,,
1,2,,,,,,,,,,,,,
1,3,,,,,,,,,,,,,
`

// for parentNumber
const INVALID_FIRST_PARENT_NUMBER = `${ALL_COLUMNS}
1,2,,,,,,,,,,,,,
`
const INVALID_PARENT_NUMBER = `${ALL_COLUMNS}
,1,,,,,,,,,,,,,
1,2,,,,,,,,,,,,,
4,3,,,,,,,,,,,,,
`

const CORRECT_PERSONS = `${ALL_COLUMNS}
,1,Claudine,Claudine Eriepa,female,birth,16,01/02/0304,no,,021123456789,claudine@me.com,123 Happy Lane,HappyVille,Teacher
1,2,Cherese,Cherese Eriepa,female,birth,2,24/02/0304,yes,24/02/0305,021167892345,cherese@me.com,123 Happy Lane,HappyVille,Software Engineer
2,3,Daynah,Daynah Eriepa,female,birth,3,24/02/0304,no,,021167823459,daynah@me.com,123 Happy Lane,HappyVille,Community Advisor
`

/*
  row 1 - incorrect relationshipType
  row 2 - incorrect DOB
  row 3 - incorrect gender
*/
const INCORRECT_PERSONS = `${ALL_COLUMNS}
,1,Claudine,Claudine Eriepa,female,bith,16,01/02/0304,no,,021123456789,claudine@me.com,123 Happy Lane,HappyVille,Teacher
1,2,Cherese,Cherese Eriepa,female,birth,2,24/02,no,,021167892345,cherese@me.com,123 Happy Lane,HappyVille,Software Engineer
2,3,Daynah,Daynah Eriepa,fema,birth,3,24/02/0304,no,,021167823459,daynah@me.com,123 Happy Lane,HappyVille,Community Advisor
`

test('header columns', t => {
  t.plan(4)
  csv.parse(ALL_COLUMNS)
    .then(res => {
      t.deepEqual(res.columns, csv.PERMITTED_CSV_COLUMNS, 'validates correct columns given')
    })

  csv.parse(MISSING_COLUMNS)
    .catch(err => {
      t.deepEqual(err, ['[columns] Missing column(s): preferredName,birthOrder,email,profession'], 'returns errors for missing columns')
    })

  csv.parse(EXTRA_COLUMNS)
    .catch(err => {
      t.deepEqual(err, ['[columns] Additional header column(s) not allowed: extra1,extra2'], 'returns error for additional columns')
    })

  csv.parse(MISPELLED_COLUMNS)
    .catch(err => {
      t.deepEqual(err, ['[columns] Missing column(s): parentNumber', '[columns] Additional header column(s) not allowed: parentNumbe'], 'returns error for wrong columns')
    })
})

test('number', t => {
  t.plan(2)
  csv.parse(DUPLICATE_NUMBERS)
    .catch(err => {
      t.deepEqual(err, ['[number] \'1\' has already been used and is not unique'], 'returns error for duplicate numbers')
    })

  csv.parse(VALID_NUMBERS)
    .then(res => {
      t.true(res.length === 3, 'returns no errors')
    })
    .catch(err => {
      console.log(err)
    })
})

test('parentNumber', t => {
  t.plan(2)
  csv.parse(INVALID_FIRST_PARENT_NUMBER)
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      t.deepEqual(err, [
        '[parentNumber] the first parent number must be empty\n [VALUE] 1',
        '[parentNumber] a parentNumber was used before its number was assigned\n [VALUE] 1'
      ], 'returns error for non-empty first parentNumber')
    })

  csv.parse(INVALID_PARENT_NUMBER)
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      t.deepEqual(err, [
        '[parentNumber] a parentNumber was used before its number was assigned\n [VALUE] 4'
      ], 'returns error for parentNumber that has number which hasnt been seen yet')
    })
})

test('csv.parse', t => {
  t.plan(2)

  csv.parse(CORRECT_PERSONS)
    .then(csv => {
      t.deepEqual(csv[1], {
        parentNumber: '1',
        number: '2',
        preferredName: 'Cherese',
        legalName: 'Cherese Eriepa',
        gender: 'female',
        relationshipType: 'birth',
        birthOrder: 2,
        deceased: true,
        aliveInterval: '0304-02-24/0305-02-24',
        phone: '021167892345',
        email: 'cherese@me.com',
        address: '123 Happy Lane',
        location: 'HappyVille',
        profession: 'Software Engineer'
      }, 'returns correct profile')
    })

  csv.parse(INCORRECT_PERSONS)
    .catch(err => { // should be 3 errors
      t.deepEqual(err, [
        '[ROW-1] [relationshipType] only accepts the following: birth,whangai,adopted\n [VALUE]: bith',
        '[ROW-2] [bornAt] should be of format DD/MM/YYYY or DD-MM-YYYY\n [VALUE]: 24-02',
        '[ROW-3] [gender] only accepts the following: male,female,other,unknown\n [VALUE]: fema'
      ], 'returns expected errors')
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

  // String Properties - no validation needed for these
  t.true(isValid('preferredName')('Cherese Eriepa'), 'preferredName can be a string')
  t.true(isValid('preferredName')(''), 'preferredName can be ""')
  // not allowed
  t.false(isValid('preferredName')(123), 'preferredName cant be a number')

  t.end()
})

test('real data', (t) => {
  const filepath = path.join(__dirname, 'fixtures', 'MOCK_DATA_150.csv')
  fs.readFile(filepath, 'utf8').then((file) => {
    t.ok(file, 'file read returns result')
    csv.parse(file).then((rows) => {
      t.ok(rows, 'csv parse returns result')

      const tree = d3.stratify()
        .id(function (d) {
          return d.number
        })
        .parentId(function (d) {
          return d.parentNumber
        })(rows)

      t.equal(rows.length, 149, 'csv parser returns correct number of rows')

      let count = 1
      const walk = (row) => {
        const seen = new Set()

        row.children.forEach((child) => {
          count += 1
          if (seen.has(child.id)) {
            t.fail('have not already seen this child')
          }
          seen.add(child.id)
          if (child.children != null) {
            walk(child)
          }
        })
      }

      t.ok(tree, 'tree exists')
      walk(tree)
      t.equal(count, rows.length, 'tree has correct number of nodes')

      const descendants = tree.descendants()

      t.equal(count, descendants.length, 'descendants has correct number of nodes')

      descendants.forEach((descendant, index) => {
        t.equal(descendant.number, descendant.data.id, 'number and id are same')
        if (index === 0) {
          t.equal(descendant.parent, null, 'root does not have parent')
        } else {
          t.ok(descendant.parent, 'non root does have parent')
        }
      })
    })
  })
  t.end()
})
