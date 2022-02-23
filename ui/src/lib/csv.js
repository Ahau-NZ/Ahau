import {
  csvParse as d3CsvParse,
  csvFormat as d3CsvFormat
} from 'd3'
import { GENDERS, RELATIONSHIPS } from './constants'
import { intervalToDayMonthYear } from './date-helpers'
import edtf from 'edtf'

const ssbUri = require('ssb-uri2')

const PERMITTED_CSV_RELATIONSHIPS = [...RELATIONSHIPS, 'partner']

const PERMITTED_CSV_COLUMNS = [
  'parentNumber',
  'number',
  'preferredName',
  'legalName',
  'gender',
  'relationshipType',
  'birthOrder',
  'bornAt',
  'placeOfBirth',
  'deceased',
  'diedAt',
  'placeOfDeath',
  'buriedLocation',
  'phone',
  'email',
  'address',
  'city',
  'postCode',
  'country',
  'profession',
  'altNames',
  'school',
  'education',
  'avatarImage',
  'headerImage'
]

function importCsv (file) {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.csv')) { // check if file extension is csv
      reject(new Error('please upload a CSV file'))
      return
    }

    var reader = new FileReader() // eslint-disable-line
    reader.readAsText(file)
    reader.onload = () => {
      const fileContent = reader.result

      parse(fileContent)
        .then(csv => resolve(csv))
        .catch(errs => reject(errs))
    }
  })
}

function parse (fileContent) {
  var count = 0
  var errors = []

  return new Promise((resolve, reject) => {
    const seen = new Set()

    const csv = d3CsvParse(fileContent, (d, i) => {
      var row = i + 1

      if (i === 0 && !isEmpty(d.parentNumber)) {
        errors.push({ row, field: 'parentNumber', error: 'the first parent number must be empty', value: d.parentNumber })
      }

      // the parentNumber should already exist as a number
      if (!isEmpty(d.parentNumber) && !seen.has(d.parentNumber)) {
        errors.push({ row, field: 'parentNumber', error: 'this parentNumber was used before it was assigned or doesnt exist', value: d.parentNumber })
      }

      count++

      const errs = personErrors(d, row)

      if (errs) {
        errors = [...errors, ...errs]
        seen.add(d.number)
      } else {
        d.bornAt = convertDate(d.bornAt)
        d.diedAt = convertDate(d.diedAt)

        var aliveInterval = `${d.bornAt}/${d.diedAt}`

        // validate the dates make up a valid interval
        if (!isValidInterval(aliveInterval)) {
          if (d.bornAt === d.diedAt) {
            aliveInterval = '/' + d.diedAt
          } else {
            errors.push({ row, field: 'bornAt, diedAt', error: 'bornAt and diedAt do not make up a valid interval', value: aliveInterval })
            aliveInterval = null
          }
        }
        if (aliveInterval === '/') aliveInterval = null

        if (d.birthOrder) {
          d.birthOrder = parseInt(d.birthOrder)
        } else {
          d.birthOrder = null
        }

        if (d.altNames) {
          d.altNames = convertToSet(d.altNames)
        } else {
          d.altNames = null
        }

        if (d.school) {
          d.school = convertToArray(d.school)
        } else {
          d.school = null
        }
        if (d.education) {
          d.education = convertToArray(d.education)
        } else {
          d.education = null
        }

        const person = {
          csvId: d.number
        }

        if (d.parentNumber) {
          person.link = {
            parentCsvId: d.parentNumber,
            childCsvId: d.number,
            relationshipType: d.relationshipType
          }
        }

        if (seen.has(d.number)) return person

        person.profile = {
          preferredName: d.preferredName,
          legalName: d.legalName,
          gender: d.gender || null,
          birthOrder: d.birthOrder,
          deceased: d.deceased === 'yes' || null,
          aliveInterval,
          placeOfBirth: d.placeOfBirth,
          placeOfDeath: d.placeOfDeath,
          buriedLocation: d.buriedLocation,
          city: d.city,
          postCode: d.postCode,
          country: d.country,
          profession: d.profession,
          school: d.school,
          education: d.education,
          altNames: d.altNames,

          // adminProfile fields
          phone: d.phone,
          email: d.email,
          address: d.address,

          // images
          avatarImage: importImage(d.avatarImage),
          headerImage: importImage(d.headerImage)
        }

        seen.add(d.number)

        return person
      }
    })

    if (count !== csv.length && errors.length === 0) {
      errors.push({ row: 'N/A', field: 'N/A', error: 'missing some entries, but no not have errors for them', value: csv })
      // this code should never be reached
    }

    // validate the header column
    errors = [...headerColumnErrors(csv.columns), ...errors]

    const maxCsvLength = 1000

    if (csv.length > maxCsvLength) {
      const lengthError = 'Aroha mai, we are currently experiencing issues processing large files. We are currently working on this and hope to have this working soon'
      errors = [{ row: 'N/A', field: 'row count', error: lengthError, value: '' }, ...errors] // make sure its the first error
    }

    if (errors.length) reject(errors)
    else resolve(csv)
  })
}

function mapNodesToCsv (nodes) {
  const rows = []

  nodes.forEach(node => {
    const nodeId = node.parent ? node.parent.data.id : ''
    const partnerId = node.data.id

    const childRow = nodeToParent(node, nodeId)
    rows.push(childRow)

    // for each node, look at their partners and create a mapping!
    const partnerRows = nodeToPartners(node, partnerId)
    if (partnerRows && partnerRows.length) rows.push(...partnerRows)
  })

  // NOTE: this method doesnt currently support exporting children having multiple parents
  return d3CsvFormat(rows)
}

function nodeToParent (node, parentId) {
  return {
    parentNumber: parentId,
    ...mapNodeToCsvRow(node.data)
  }
}

function nodeToPartners (node, partnerId) {
  const rows = []
  node.data.partners.forEach(partner => {
    const row = nodeToPartner(partner, partnerId)
    rows.push(row)
  })
  return rows
}

function nodeToPartner (node, partnerId) {
  return {
    parentNumber: partnerId,
    ...mapNodeToCsvRow({ ...node, relationshipType: 'partner' })
  }
}

function mapNodeToCsvRow (d) {
  var aliveInterval = d.aliveInterval ? intervalToDayMonthYear(d.aliveInterval) : null
  var altNames = d.altNames.length > 0 ? d.altNames.join(', ') : null
  var school = d.school.length > 0 ? d.school.join(', ') : null
  var education = d.education.length > 0 ? d.education.join(', ') : null

  const row = {
    number: d.id,
    preferredName: d.preferredName,
    legalName: d.legalName,
    altNames: altNames,
    gender: d.gender,
    relationshipType: d.relationshipType,
    birthOrder: d.birthOrder,
    deceased: d.deceased ? 'yes' : null,
    bornAt: aliveInterval && aliveInterval[0].length ? aliveInterval[0] : null,
    diedAt: aliveInterval && aliveInterval[1].length ? aliveInterval[1] : null,
    placeOfBirth: d.placeOfBirth,
    placeOfDeath: d.placeOfDeath,
    buriedLocation: d.buriedLocation,
    city: d.city,
    postCode: d.postCode,
    country: d.country,
    profession: d.profession,
    education: education,
    school: school,
    avatarImage: exportImage(d.avatarImage),
    headerImage: exportImage(d.headerImage)
  }

  row.phone = d.adminProfile ? d.adminProfile.phone : ''
  row.email = d.adminProfile ? d.adminProfile.email : ''
  row.address = d.adminProfile ? d.adminProfile.address : ''

  return row
}

function personErrors (d, row) {
  // d = a particular rows data
  // i = row number

  var errors = []
  // loops through the schema and validates the relevant fields
  Object.keys(schema)
    .filter(key => !schema[key].action(d[key])) // the action is the validation function for this key
    .forEach(key => {
      if (key === 'parentNumber' && row === 0) return
      if (d[key] !== undefined) {
        // dont include undefined values in the errors
        errors.push({ row, field: key, error: schema[key].msg, value: d[key] })
      }
    })

  if (errors.length) return errors
}

const validateString = {
  action: d => isString(d) || isEmpty(d),
  masg: 'must be a string or empty'
}

const schema = {
  parentNumber: {
    action: d => isValidId(d) || isEmpty(d),
    msg: 'must be either a number, id or empty'
  },
  number: {
    action: d => isValidId(d) && d != null,
    msg: 'is required and must be a number or id'
  },
  preferredName: validateString,
  legalName: validateString,
  gender: {
    action: d => GENDERS.includes(d) || isEmpty(d),
    msg: 'only accepts the following: ' + GENDERS
  },
  bornAt: {
    action: d => isValidDate(d),
    msg: 'should be of format DD/MM/YYYY or DD-MM-YYYY'
  },
  placeOfBirth: validateString,
  deceased: {
    action: d => ['yes', 'no', '', null].includes(d),
    msg: 'must be either yes, no or empty'
  },
  diedAt: {
    action: d => isValidDate(d),
    msg: 'should be of format DD/MM/YYYY or DD-MM-YYYY'
  },
  placeOfDeath: validateString,
  birthOrder: {
    action: d => isValidNumber(d) || isEmpty(d),
    msg: 'must be either a number or empty'
  },
  buriedLocation: {
    action: d => isString(d) || isEmpty(d),
    msg: 'must be either a string or empty'
  },
  relationshipType: {
    action: d => PERMITTED_CSV_RELATIONSHIPS.includes(d) || isEmpty(d),
    msg: 'only accepts the following: ' + PERMITTED_CSV_RELATIONSHIPS
  },
  email: validateString,
  city: validateString,
  postCode: validateString,
  country: validateString,
  school: validateString,
  education: validateString,
  altNames: validateString
}

function isEmpty (d) {
  return d === null || d === '' || d === undefined
}

function isString (d) {
  return typeof d === 'string'
}

var dateRegex = /^(0[1-9]|[0-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4}$/

function isValidDate (d) {
  return isEmpty(d) || dateRegex.test(d)
}

function isValidId (d) {
  if (d === null) return false
  if (d === '') return false

  return true
}

function isValidNumber (d) {
  if (d === null) return false
  if (d === '') return false

  if (isNaN(d)) return false
  if (Number(d) % 1 !== 0) return false
  if (Number(d) < 0) return false
  return true
}

/*
  NOTE: expects headers to be:
  {
    preferredName: '',
    legalName: '',
    etc.....
  }
  as given by d3.csvParse()
*/
function headerColumnErrors (headers) {
  var errors = []

  const missingColumns = PERMITTED_CSV_COLUMNS.filter(d => {
    return !headers.includes(d)
  })

  if (missingColumns.length > 0) {
    errors.push({ row: 'header', field: 'columns', error: 'missing column(s)', value: missingColumns })
  }

  const additionalColumns = headers.filter(d => {
    return !PERMITTED_CSV_COLUMNS.includes(d)
  })

  if (additionalColumns.length > 0) {
    errors.push({ row: 'header', field: 'columns', error: 'additional header column(s) are not allowed', value: additionalColumns })
  }

  return errors
}

/*
  Convert date to YYYY-MM-DD
*/
function convertDate (date) {
  if (!date) return ''
  // the date is valid so we can convert it
  var [day, month, year] = date.replace(/\//g, '-').split('-')
  day = convertDigit(day)
  month = convertDigit(month)
  var _date = `${year}-${month}-${day}`

  return _date
}

function convertToSet (str) {
  var set = { add: [] }
  if (str.indexOf(', ') > -1) {
    str = str.split(',')
    str.forEach(i => set.add.push(i))
  } else {
    set.add.push(str)
  }
  return set
}

function convertToArray (arr) {
  if (arr.indexOf(', ') > -1) {
    arr = arr.split(', ')
  }
  return arr
}

function isValidInterval (interval) {
  if (interval === '/' || interval === '' || interval === null) return true

  try {
    edtf(interval)
    return true
  } catch (err) {
    return false
  }
}

function convertDigit (digit) {
  if (digit.length === 1) return '0' + digit
  return digit
}

function downloadCsv () {
  var csv = PERMITTED_CSV_COLUMNS.join(',') + '\n'
  var hiddenElement = document.createElement('a')
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv)
  hiddenElement.target = '_blank'
  hiddenElement.download = 'whakapapa.csv'
  hiddenElement.click()
}

function exportImage (image) {
  if (!image || !image.blob) return ''

  let unbox = image.unbox

  // convert the blob to uri
  const newUri = ssbUri.fromBlobSigil(image.blob)
    .replace('sha256', 'classic')

  if (!unbox && image.uri) {
    // get the unbox key from the uri
    unbox = new URL(image.uri).searchParams.get('unbox')
  }

  const result = new URL(newUri)
  result.searchParams.set('mimeType', image.mimeType)
  result.searchParams.set('unbox', unbox)

  return result.toString()
}

function importImage (uri) {
  if (!uri || uri === '') return null

  const blob = ssbUri.toBlobSigil(uri)

  const params = new URL(uri).searchParams

  return {
    blob,
    mimeType: params.get('mimeType'),
    unbox: params.get('unbox')
  }
}

export {
  importCsv,
  mapNodesToCsv,
  convertDate,
  parse,
  downloadCsv,
  schema,
  PERMITTED_CSV_COLUMNS,
  exportImage,
  importImage
}
