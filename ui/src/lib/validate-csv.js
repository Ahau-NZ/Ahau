import isEmpty from 'lodash.isempty'

export default {
  person,
  csv
}

var date = /^(0?[1-9]|[12][0-9]|3[01])[/-](0?[1-9]|1[012])[/-]\d{4}$/
var val = /^\d+$/

function person (d) {
  var errorObj = {
    msg: [],
    isError: false
  }

  if (isEmpty(d.number)) {
    // console.log('no number entered for ' + d.preferredName)
    errorObj.msg = 'no number entered for ' + d.preferredName
    errorObj.isError = true
    return errorObj
  }
  if (!isEmpty(d.bornAt) && !date.test(d.bornAt)) {
    // console.log('bornAt entered incorretly for ' + d.preferredName)
    errorObj.msg = 'bornAt entered incorretly for ' + d.preferredName
    errorObj.isError = true
    return errorObj
  }
  if (!isEmpty(d.diedAt) && !date.test(d.diedAt)) {
    // console.log('diedAt entered incorretly for ' + d.preferredName)
    errorObj.msg = 'diedAt entered incorretly for ' + d.preferredName
    errorObj.isError = true
    return errorObj
  }
  if (!isEmpty(d.birthOrder) && !val.test(d.birthOrder)) {
    // console.log('birthOrder entered incorretly for ' + d.preferredName)
    errorObj.msg = 'birthOrder entered incorretly for ' + d.preferredName
    errorObj.isError = true
    return errorObj
  }
  if (!isEmpty(d.relationshipType) && (d.relationshipType !== 'birth' && d.relationshipType !== 'adopted' && d.relationshipType !== 'whangai')) {
    // console.log('relationshipType entered incorrectly for ' + d.preferredName)
    errorObj.msg = 'relationshipType entered incorretly for ' + d.preferredName
    errorObj.isError = true
    return errorObj
  }
  if (!isEmpty(d.deceased) && (d.deceased !== 'yes')) {
    // console.log('deceased entered incorrectly for ' + d.preferredName)
    errorObj.msg = 'deceased entered incorretly for ' + d.preferredName
    errorObj.isError = true
    return errorObj
  }
  // no errors
  errorObj = {
    msg: [],
    isError: false
  }
  return errorObj
}

function csv (csv) {
  // - check for correct columns
  // console.log('validate csv')
  // switch (csv) {  //   case (csv.columns.length > 14) :
  //     alert("An extra column has been dectected. Unforetunately columns cannot be added to the csv and the data will not be included in the whakapapa")
  //     break
  //   case (typeof csv[0] === "undefined") :
  //     alert("no data detected")
  //     break
  //   case ()
  //   }
  // }
}
