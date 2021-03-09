import * as d3 from 'd3'
import { GENDERS, RELATIONSHIPS } from './constants'
import edtf from 'edtf'

const PERMITTED_CSV_COLUMNS = [
  'parentNumber',
  'number',
  'preferredName',
  'legalName',
  'gender',
  'relationshipType',
  'birthOrder',
  'bornAt',
  'deceased',
  'diedAt',
  'phone',
  'email',
  'address',
  'city',
  'country',
  'profession'
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

    const csv = d3.csvParse(fileContent, (d, i) => {
      var row = i + 1

      if (i === 0 && !isEmpty(d.parentNumber)) {
        errors.push({ row, field: 'parentNumber', error: 'the first parent number must be empty', value: d.parentNumber })
      }

      if (seen.has(d.number)) {
        errors.push({ row, field: 'number', error: 'the number is not unique', value: d.number })
      }

      seen.add(d.number)

      // the parentNumber should already exist as a number
      if (!isEmpty(d.parentNumber) && !seen.has(d.parentNumber)) {
        errors.push({ row, field: 'parentNumber', error: 'this parentNumber was used before it was assigned or doesnt exist', value: d.parentNumber })
      }

      count++

      const errs = personErrors(d, row)

      if (errs) {
        errors = [...errors, ...errs]
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

        if (d.birthOrder) {
          d.birthOrder = parseInt(d.birthOrder)
        } else {
          d.birthOrder = null
        }

        return {
          parentNumber: d.parentNumber,
          number: d.number,
          preferredName: d.preferredName,
          legalName: d.legalName,
          gender: d.gender,
          relationshipType: d.relationshipType ? d.relationshipType : 'birth',
          birthOrder: d.birthOrder,
          deceased: d.deceased === 'yes',
          aliveInterval,
          phone: d.phone,
          email: d.email,
          address: d.address,
          city: d.city,
          country: d.country,
          profession: d.profession
        }
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

const schema = {
  parentNumber: {
    action: d => isValidNumber(d) || isEmpty(d),
    msg: 'must be either a number or empty'
  },
  number: {
    action: d => isValidNumber(d) && d != null,
    msg: 'is required and must be a number'
  },
  preferredName: {
    action: d => isString(d) || isEmpty(d),
    msg: 'must be a string or empty'
  },
  gender: {
    action: d => GENDERS.includes(d) || isEmpty(d),
    msg: 'only accepts the following: ' + GENDERS
  },
  bornAt: {
    action: d => isValidDate(d),
    msg: 'should be of format DD/MM/YYYY or DD-MM-YYYY'
  },
  deceased: {
    action: d => ['yes', 'no', '', null].includes(d),
    msg: 'must be either yes, no or empty'
  },
  diedAt: {
    action: d => isValidDate(d),
    msg: 'should be of format DD/MM/YYYY or DD-MM-YYYY'
  },
  birthOrder: {
    action: d => isValidNumber(d) || isEmpty(d),
    msg: 'must be either a number or empty'
  },
  relationshipType: {
    action: d => RELATIONSHIPS.includes(d) || isEmpty(d),
    msg: 'only accepts the following: ' + RELATIONSHIPS
  },
  email: {
    action: d => isString(d) || isEmpty(d),
    msg: 'must be a string or empty'
  }
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

export {
  importCsv,
  convertDate,
  parse,
  schema,
  PERMITTED_CSV_COLUMNS
}
