import test from 'tape'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  hierarchy as d3Hierarchy,
  stratify as d3Stratify,
  csvFormat as d3CsvFormat
} from 'd3'

import * as csv from './csv.mjs'
import simpleNestedDescendants from '../mocks/nested-whakapapa.mjs'

// polyfill __dirname!
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// NOTE: column names need to be on same line as opening of string literal
// for columns
const ALL_COLUMNS = csv.PERMITTED_CSV_COLUMNS.join(',')
const MISSING_COLUMNS = 'parentNumber,number,legalName,gender,relationshipType,bornAt,placeOfBirth,placeOfDeath,buriedLocation,deceased,diedAt,phone,address,city,avatarImage,headerImage'
const EXTRA_COLUMNS = `${ALL_COLUMNS},extra1,extra2
`
// const MISPELLED_COLUMNS = 'parentNumber,number,preferredName,legalName,genda,relationshipType,birthOrder,bornAt,placeOfBirth,deceased,diedAt,placeOfDeath,buriedLocation,phone,email,address,city,postCode,country,profession,altNames,school,education,avatarImage,headerImage'

// for parentNumber
const INVALID_FIRST_PARENT_NUMBER = `${ALL_COLUMNS}
1,2,,,,,,,,,,,,,,,,,,
`
const INVALID_PARENT_NUMBER = `${ALL_COLUMNS}
,1,,,,,,,,,,,,,,,,,,
1,2,,,,,,,,,,,,,,,,,,
4,3,,,,,,,,,,,,,,,,,,
`

const CORRECT_PERSONS = `${ALL_COLUMNS}
,1,Claudine,Claudine Eriepa,female,birth,16,01/02/0304,,no,,,,021123456789,claudine@me.com,123 Happy Lane,HappyVille,1234,New Zealand,Teacher
1,2,Cherese,Cherese Eriepa,female,birth,2,24/02/0304,Auckland,yes,24/02/0305,Hamilton,New Zealand,021167892345,cherese@me.com,123 Happy Lane,HappyVille,1234,New Zealand,Software Engineer
2,3,Daynah,Daynah Eriepa,female,birth,3,24/02/0304,,no,,,,021167823459,daynah@me.com,123 Happy Lane,HappyVille,1234,New Zealand,Community Advisor
`

/*
  row 1 - incorrect relationshipType
  row 2 - incorrect DOB
  row 3 - incorrect gender
*/
const INCORRECT_PERSONS = `${ALL_COLUMNS}
,1,Claudine,Claudine Eriepa,female,bith,16,01/02/0304,,no,,,,021123456789,claudine@me.com,123 Happy Lane,HappyVille,1234,New Zealand,Teacher
1,2,Cherese,Cherese Eriepa,female,birth,2,24/02,,no,,,,021167892345,cherese@me.com,123 Happy Lane,HappyVille,1234,New Zealand,Software Engineer
2,3,Daynah,Daynah Eriepa,fema,birth,3,24/02/0304,,no,,,,021167823459,daynah@me.com,123 Happy Lane,HappyVille,1234,New Zealand,Community Advisor
`

test('header columns', t => {
  t.plan(2)
  csv.parse(ALL_COLUMNS)
    .then(res => {
      t.deepEqual(res.columns, csv.PERMITTED_CSV_COLUMNS, 'validates correct columns given')
    })

  csv.parse(MISSING_COLUMNS)
    .catch(err => {
      t.deepEqual(err, [
        { row: 'header', field: 'columns', error: 'missing column(s)', value: ['preferredName', 'birthOrder', 'email', 'postCode', 'country', 'profession', 'altNames', 'school', 'education'] }
      ], 'returns errors for missing columns')
    })

  // csv.parse(EXTRA_COLUMNS)
  //   .catch(err => {
  //     t.deepEqual(err, [
  //       { row: 'header', field: 'columns', error: 'additional header column(s) are not allowed', value: ['extra1', 'extra2'] }
  //     ], 'returns error for additional columns')
  //   })

  // csv.parse(MISPELLED_COLUMNS)
  //   .catch(err => {
  //     t.deepEqual(err[1], {
  //       row: 'header', field: 'columns', error: 'additional header column(s) are not allowed', value: ['genda']
  //     },
  //     'returns error for wrong columns'
  //     )
  //   })
})

test('additional columns', t => {
  t.plan(2)

  csv.parse(EXTRA_COLUMNS)
    .then(res => {
      t.deepEqual(res.additionalColumns, ['extra1', 'extra2'], 'returns the additional columns')
      t.deepEqual(res.columns, [
        'parentNumber', 'number',
        'preferredName', 'legalName',
        'gender', 'relationshipType',
        'birthOrder', 'bornAt',
        'placeOfBirth', 'deceased',
        'diedAt', 'placeOfDeath',
        'buriedLocation', 'phone',
        'email', 'address',
        'city', 'postCode',
        'country', 'profession',
        'altNames', 'school',
        'education', 'avatarImage',
        'headerImage', 'description',
        'extra1', 'extra2'
      ], 'returns all columns including the additional ones')
    })
})

test('parentNumber', t => {
  t.plan(2)
  csv.parse(INVALID_FIRST_PARENT_NUMBER)
    .then(res => {
      // console.log(res)
    })
    .catch(err => {
      t.deepEqual(err, [
        { row: 1, field: 'parentNumber', error: 'the first parent number must be empty', value: '1' },
        { row: 1, field: 'parentNumber', error: 'this parentNumber was used before it was assigned or doesnt exist', value: '1' }
      ], 'returns error for non-empty first parentNumber')
    })

  csv.parse(INVALID_PARENT_NUMBER)
    .then(res => {
      // console.log(res)
    })
    .catch(err => {
      t.deepEqual(err, [
        { row: 3, field: 'parentNumber', error: 'this parentNumber was used before it was assigned or doesnt exist', value: '4' }
      ], 'returns error for parentNumber that has number which hasnt been seen yet')
    })
})

test('csv export + import (PersonIndex)', t => {
  const profileData = {
    preferredName: 'Cherese',
    legalName: 'Cherese Eriepa',
    gender: 'female',
    birthOrder: 2,
    deceased: true,
    aliveInterval: '0304-02-24/0305-02-24',
    placeOfBirth: 'Auckland',
    placeOfDeath: 'Hamilton',
    buriedLocation: 'New Zealand',
    city: 'HappyVille',
    postCode: '1234',
    country: 'New Zealand',
    profession: 'Software Engineer',
    school: null,
    education: null,
    altNames: ['reese', 'cher'],

    // adminProfile fields
    phone: '021167892345',
    email: 'cherese@me.com',
    address: '123 Happy Lane',

    headerImage: null,
    avatarImage: null,
    customFields: {}
  }
  const input = [{
    id: '%MSG_ID',
    ...profileData
  }]

  const rows = input.map(profile => csv.mapNodeToCsvRow(profile))
  const output = d3CsvFormat(rows)

  csv.parse(output, true) // true => isFromPersonIndex
    .then(csv => {
      t.deepEqual(
        csv.map(row => row.profile),
        [{
          ...profileData,
          altNames: {
            add: profileData.altNames
          }
        }]
      )
    })
    .catch(err => {
      t.error(err)
      console.log(err)
    })
    .finally(t.end)
})

test('csv.parse', t => {
  t.plan(2)

  csv.parse(CORRECT_PERSONS)
    .then(csv => {
      t.deepEqual(csv[1], {
        csvId: '2',
        link: {
          parentCsvId: '1',
          childCsvId: '2',
          relationshipType: 'birth'
        },
        profile: {
          preferredName: 'Cherese',
          legalName: 'Cherese Eriepa',
          gender: 'female',
          birthOrder: 2,
          deceased: true,
          aliveInterval: '0304-02-24/0305-02-24',
          placeOfBirth: 'Auckland',
          placeOfDeath: 'Hamilton',
          buriedLocation: 'New Zealand',
          city: 'HappyVille',
          postCode: '1234',
          country: 'New Zealand',
          profession: 'Software Engineer',
          school: null,
          education: null,
          altNames: null,

          // adminProfile fields
          phone: '021167892345',
          email: 'cherese@me.com',
          address: '123 Happy Lane',

          headerImage: null,
          avatarImage: null,
          customFields: {}
        }
      }, 'returns correct profile')
    })
    .catch(t.error)

  csv.parse(INCORRECT_PERSONS)
    .catch(err => { // should be 3 errors
      t.deepEqual(err, [
        { row: 1, field: 'relationshipType', error: 'only accepts the following: birth,whangai,adopted,partner', value: 'bith' },
        { row: 2, field: 'bornAt', error: 'should be of format DD/MM/YYYY or DD-MM-YYYY', value: '24/02' },
        { row: 3, field: 'gender', error: 'only accepts the following: male,female,other,unknown', value: 'fema' }
      ], 'returns expected errors')
    })
})

test('real data', (t) => {
  t.plan(304)

  const filepath = path.join(__dirname, 'fixtures', 'MOCK_DATA_150.csv')
  fs.readFile(filepath, 'utf8').then((file) => {
    t.ok(file, 'file read returns result')

    csv.parse(file)
      .catch((err) => {
        t.error(err, 'csv parse failed because of an error')
        // console.error('ERROR: ', JSON.stringify(err, null, 2))
      })
      .then((rows) => {
        t.ok(rows, 'csv parse returns result')

        const tree = d3Stratify()
          .id(function (d) {
            return d.csvId
          })
          .parentId(function (d) {
            return (d.link && d.link.parentCsvId)
              ? d.link.parentCsvId
              : null // NOTE: only the first d shouldnt have a link.parentCsvId
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
  t.true(isValid('number')('dog'), 'number can be string')
  // not allowed
  t.false(isValid('number')(null), 'number cannot be null')
  t.false(isValid('number')(undefined), 'number cannot be undefined')
  t.false(isValid('number')(''), 'number cannot be ""')

  // PARENT NUMBER

  // allowed
  t.true(isValid('parentNumber')(11), 'parentNumber can be a number')
  t.true(isValid('parentNumber')(''), 'parentNumber can be a empty string')
  t.true(isValid('parentNumber')(null), 'parentNumber can be a null')
  t.true(isValid('parentNumber')('meow'), 'parentNumber can be a string')

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
  t.true(isValid('bornAt')('1-1-2018'), 'bornAt can be D-M-YYYY')
  t.true(isValid('bornAt')('01-01-2018'), 'bornAt can be DD-MM-YYYY')
  t.true(isValid('bornAt')('1-01-2018'), 'bornAt can be D-MM-YYYY')
  t.true(isValid('bornAt')('11-1-2018'), 'bornAt can be DD-M-YYYY')
  t.true(isValid('bornAt')(''), 'bornAt can be empty')
  t.true(isValid('bornAt')(null), 'bornAt can be null')
  // not allowed
  t.false(isValid('bornAt')('04-21-2018'), 'bornAt cannot be MM-DD-YYYY') // american style
  t.false(isValid('bornAt')('04/21/2018'), 'bornAt cannot be MM/DD/YYYY') // american style
  t.false(isValid('bornAt')('32-01-2018'), 'bornAt invalid day - 32')
  t.false(isValid('bornAt')('00-01-2018'), 'bornAt invalid day - 0')
  t.false(isValid('bornAt')('01-13-2018'), 'bornAt invalid month - 13')
  t.false(isValid('bornAt')('01-00-2018'), 'bornAt invalid month - 0')
  t.false(isValid('bornAt')('meow'), 'bornAt cannot be any string')
  t.false(isValid('bornAt')(12), 'bornAt cannot be number')

  // DIED AT

  // allowed
  t.true(isValid('diedAt')('21/04/2018'), 'diedAt can be DD/MM/YYYY')
  t.true(isValid('diedAt')('21-04-2018'), 'diedAt can be DD-MM-YYYY')
  t.true(isValid('diedAt')('1-1-2018'), 'diedAt can be D-M-YYYY')
  t.true(isValid('diedAt')('01-01-2018'), 'diedAt can be DD-MM-YYYY')
  t.true(isValid('diedAt')('1-01-2018'), 'diedAt can be D-MM-YYYY')
  t.true(isValid('diedAt')('11-1-2018'), 'diedAt can be DD-M-YYYY')
  t.true(isValid('diedAt')(''), 'diedAt can be empty')
  t.true(isValid('diedAt')(null), 'diedAt can be null')
  // not allowed
  t.false(isValid('diedAt')('04-21-2018'), 'diedAt cannot be MM-DD-YYYY') // american style
  t.false(isValid('diedAt')('04/21/2018'), 'diedAt cannot be MM/DD/YYYY') // american style
  t.false(isValid('diedAt')('32-01-2018'), 'diedAt invalid day - 32')
  t.false(isValid('diedAt')('00-01-2018'), 'diedAt invalid day - 0')
  t.false(isValid('diedAt')('01-13-2018'), 'diedAt invalid month - 13')
  t.false(isValid('diedAt')('01-00-2018'), 'diedAt invalid month - 0')
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

test('csv.convertDate', (t) => {
  t.plan(8)
  function convert (date, expectedRes) {
    const res = csv.convertDate(date)
    t.true(res, date + ' returns result')
    t.deepEqual(res, expectedRes, date + ' returns expected result ' + expectedRes)
  }

  convert('24/07/1995', '1995-07-24')
  convert('1/07/1997', '1997-07-01')
  convert('01/7/1997', '1997-07-01')
  convert('1/7/1997', '1997-07-01')
})

test('csv export + import (Table)', t => {
  // use the nestedDescendants to generate nodes
  const nodes = d3Hierarchy(simpleNestedDescendants)
    .descendants()

  const customFieldDefs = [
    {
      key: '1657760348525',
      label: 'Vet location',
      type: 'text',
      required: false,
      visibleBy: 'members',
      tombstone: null,
      __typename: 'CommunityCustomField'
    },
    {
      key: '1657760334524',
      label: 'Vet',
      type: 'text',
      required: false,
      visibleBy: 'members',
      tombstone: null,
      __typename: 'CommunityCustomField'
    },
    {
      key: '1657760322525',
      label: 'Pet names',
      type: 'array',
      required: true,
      visibleBy: 'members',
      tombstone: null,
      __typename: 'CommunityCustomField'
    },
    {
      key: '1657760306958',
      label: 'Number of pets',
      type: 'number',
      required: true,
      visibleBy: 'members',
      tombstone: null,
      __typename: 'CommunityCustomField'
    }
  ]

  // run the nodes through the csv row mapping
  const output = csv.mapNodesToCsv(nodes, customFieldDefs)

  const filepath = path.join(__dirname, 'fixtures', 'nested-whakapapa.csv')
  fs.readFile(filepath, 'utf8')
    .then((file) => {
      t.ok(file, 'file read returns result')

      t.equal(
        output.trim(),
        file.trim(),
        'returns expected csv'
      )

      csv.parse(output, false) // false => !isFromPersonIndex
        .then(result => {
          // console.log(JSON.stringify(result, null, 2))
          t.equal(result.length, 3, 'parses fine')
        })
        .catch(err => {
          t.error(err)
          console.log(err)
        })
        .finally(t.end)
    })
})
