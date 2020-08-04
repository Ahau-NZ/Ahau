import * as d3 from 'd3'
import { GENDERS, RELATIONSHIPS } from './constants'

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
  'location',
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
      if (i === 0 && !isEmpty(d.parentNumber)) {
        errors.push('[parentNumber] the first parent number must be empty\n [VALUE] ' + d.parentNumber)
      }

      if (seen.has(d.number)) {
        errors.push(`[number] '${d.number}' has already been used and is not unique`)
      }

      seen.add(d.number)

      // the parentNumber should already exist as a number
      if (!isEmpty(d.parentNumber) && !seen.has(d.parentNumber)) {
        errors.push('[parentNumber] a parentNumber was used before its number was assigned\n [VALUE] ' + d.parentNumber)
      }

      count++

      d.bornAt = d.bornAt.replace(/\//g, '-')
      d.diedAt = d.diedAt.replace(/\//g, '-')

      const errs = personErrors(d, i)

      if (errs) {
        errors = [...errors, ...errs]
      } else {
        if (d.bornAt) {
          const [day, month, year] = d.bornAt.split('-')
          d.bornAt = `${year}-${month}-${day}`
        }

        if (d.diedAt) {
          const [day, month, year] = d.diedAt.split('-')
          d.diedAt = `${year}-${month}-${day}`
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
          aliveInterval: d.bornAt + '/' + d.diedAt,
          phone: d.phone,
          email: d.email,
          address: d.address,
          location: d.location,
          profession: d.profession
        }
      }
    })

    if (count !== csv.length && errors.length === 0) {
      throw new Error('missed some entries, but do not have errors for them')
      // this code should never be reached
    }

    // validate the header column
    errors = [...headerColumnErrors(csv.columns), ...errors]

    const maxCsvLength = 1000

    if (csv.length > maxCsvLength) {
      errors.push('Aroha mai, we are currently experiencing issues processing large files. We are currently working on this and hope to have this working soon')
    }

    if (errors.length) reject(errors)
    else resolve(csv)
  })
}

function personErrors (d, i) {
  // d = a particular rows data
  // i = row number

  var errors = []
  // loops through the schema and validates the relevant fields
  Object.keys(schema)
    .filter(key => !schema[key].action(d[key])) // the action is the validation function for this key
    .forEach(key => {
      if (key === 'parentNumber' && i === 0) return
      if (d[key] !== undefined) {
        // dont include undefined values in the errors
        errors.push(`[ROW-${i + 1}] ${schema[key].msg} [VALUE]: ${d[key]}`)
      }
    })

  if (errors.length) return errors
}

const schema = {
  parentNumber: {
    action: d => isValidNumber(d) || isEmpty(d),
    msg: '[parentNumber] must be either a number or empty\n'
  },
  number: {
    action: d => isValidNumber(d) && d != null,
    msg: '[number] is required and must be a number\n'
  },
  preferredName: {
    action: d => isString(d) || isEmpty(d),
    msg: '[preferredName] must be a string or empty\n'
  },
  gender: {
    action: d => GENDERS.includes(d) || isEmpty(d),
    msg: '[gender] only accepts the following: ' + GENDERS + '\n'
  },
  bornAt: {
    action: d => isValidDate(d),
    msg: '[bornAt] should be of format DD/MM/YYYY or DD-MM-YYYY\n'
  },
  deceased: {
    action: d => ['yes', 'no', '', null].includes(d),
    msg: '[deceased must be either yes, no or empty]'
  },
  diedAt: {
    action: d => isValidDate(d),
    msg: '[diedAt] should be of format DD/MM/YYYY or DD-MM-YYYY\n'
  },
  birthOrder: {
    action: d => isValidNumber(d) || isEmpty(d),
    msg: '[birthOrder] must be either a number or empty\n'
  },
  relationshipType: {
    action: d => RELATIONSHIPS.includes(d) || isEmpty(d),
    msg: '[relationshipType] only accepts the following: ' + RELATIONSHIPS + '\n'
  },
  email: {
    action: d => isString(d) || isEmpty(d),
    msg: '[email] must be a string or empty\n'
  }
}

function isEmpty (d) {
  return d === null || d === '' || d === undefined
}

function isString (d) {
  return typeof d === 'string'
}

var dateRegex = /^(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4}$/

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
    errors = ['[columns] Missing column(s): ' + missingColumns]
  }

  const additionalColumns = headers.filter(d => {
    return !PERMITTED_CSV_COLUMNS.includes(d)
  })

  if (additionalColumns.length > 0) {
    errors = [...errors, '[columns] Additional header column(s) not allowed: ' + additionalColumns]
  }

  return errors
}

export {
  importCsv,
  parse,
  schema,
  PERMITTED_CSV_COLUMNS
}
