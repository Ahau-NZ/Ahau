import * as d3 from 'd3'
import { GENDERS, RELATIONSHIPS } from './constants'

const dateRegex = /^([0-2][0-9]|(3)[0-1])(\/|-)(((0)[0-9])|((1)[0-2]))(\/|-)\d{4}$/
const emailRegex = /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/

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
    const csv = d3.csvParse(fileContent, (d, i) => {
      count++

      const errs = personErrors(d, i)

      if (errs) errors = [...errors, ...errs]
      else {
        return {
          parentNumber: d.parentNumber,
          number: d.number,
          preferredName: d.preferredName,
          legalName: d.legalName,
          gender: d.gender,
          bornAt: d.bornAt.split(/\//).reverse().join('/'),
          diedAt: d.diedAt.split(/\//).reverse().join('/'),
          birthOrder: d.birthOrder,
          phone: d.phone,
          email: d.email,
          address: d.address,
          location: d.location,
          profession: d.profession,
          relationshipType: d.relationshipType ? d.relationshipType : 'birth',
          deceased: d.deceased
        }
      }
    })

    if (count !== csv.length && errors.length === 0) {
      throw new Error('missed some entries, but do not have errors for them')
      // this code should never be reached
    }

    if (csv.length > 200) {
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
      errors.push(`[ROW-${i + 2}] ${schema[key].msg} [VALUE]: ${d[key]}`)
      // CHECK is (i+2) the row or line in the file?
    })

  if (errors.length) return errors
}

const schema = {
  parentNumber: {
    action: d => isValidNumber(d) || isEmpty(d),
    msg: '[parentNumber] must be either a number or empty'
  },
  number: {
    action: d => isValidNumber(d) && d != null,
    msg: '[number] is required and must be a number'
  },
  preferredName: {
    action: d => isString(d) || isEmpty(d),
    msg: '[preferredName] must be a string or empty'
  },
  gender: {
    action: d => GENDERS.includes(d) || isEmpty(d),
    msg: '[gender] only accepts the following: ' + GENDERS
  },
  bornAt: {
    action: d => isValidDate(d),
    msg: '[bornAt] should be of format DD/MM/YYYY or DD-MM-YYYY'
  },
  diedAt: {
    action: d => isValidDate(d),
    msg: '[diedAt] should be of format DD/MM/YYYY or DD-MM-YYYY'
  },
  birthOrder: {
    action: d => isValidNumber(d) || isEmpty(d),
    msg: '[birthOrder] must be either a number or empty'
  },
  relationshipType: {
    action: d => RELATIONSHIPS.includes(d) || isEmpty(d),
    msg: '[relationshipType] only accepts the following: ' + RELATIONSHIPS
  },
  email: {
    action: d => emailRegex.test(d) || isEmpty(d),
    msg: '[email] only accepts valid email address with @ and domain name extension. '
  }
}

function isEmpty (d) {
  return d === null || d === '' || d === undefined
}

function isString (d) {
  return typeof d === 'string'
}

function isValidDate (d) {
  return dateRegex.test(d) || isEmpty(d)
}

function isValidNumber (d) {
  if (d === null) return false
  if (d === '') return false
  if (isNaN(d)) return false
  if (Number(d) % 1 !== 0) return false
  if (Number(d) < 0) return false
  return true
}

export {
  importCsv,
  parse,
  schema
}
