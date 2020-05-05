import * as d3 from 'd3'
import isEmpty from 'lodash.isempty'

export {
  importCsv,
  parse,
  validatePerson
}

export default function importCsv (file) {
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
    const csv = d3.csvParse(fileContent, (d) => {
      count++

      // validate each row (aka d)
      const error = validatePerson(d)

      // error detected
      if (error) errors.push(error)
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
var date = /^(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4}$/
var val = /^\d+$/
function validatePerson (d) {
  var errors = []

  if (isEmpty(d.number)) errors.push('no "number" entered')
  if (!isEmpty(d.bornAt) && !date.test(d.bornAt)) errors.push('bornAt entered incorretly')
  if (!isEmpty(d.diedAt) && !date.test(d.diedAt)) errors.push('diedAt entered incorretly')
  if (!isEmpty(d.birthOrder) && !val.test(d.birthOrder)) errors.push('birthOrder entered incorretly')
  if (!isEmpty(d.relationshipType) && (d.relationshipType !== 'birth' && d.relationshipType !== 'adopted' && d.relationshipType !== 'whangai')) {
    errors.push('relationshipType entered incorretly')
  }
  if (!isEmpty(d.deceased) && (d.deceased !== 'yes')) errors.push('deceased entered incorretly')

  if (!errors.length) return

  return new Error(`${d.preferredName}: ${errors.join(', ')}`)
}

// function csv (data) {
//   // check for correct columns
//   console.log('validate csv')
//   switch (data) {  //   case (data.columns.length > 14) :
//       alert("An extra column has been dectected. Unforetunately columns cannot be added to the csv and the data will not be included in the whakapapa")
//       break
//     case (typeof data[0] === "undefined") :
//       alert("no data detected")
//       break
//     case ()
//     }
//   }
// }
