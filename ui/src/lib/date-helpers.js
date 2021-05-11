import edtf from 'edtf'

export function dateIntervalToString (interval) {
  if (interval === null) return ''

  const [lower, upper] = interval.split('/')
  if (lower.length && upper.length) {
    if (lower === upper) return `${humanDate(lower)}`
    return `${humanDate(lower)} - ${humanDate(upper)}`
  }
  if (lower.length) return humanDate(lower)
  if (upper.length) return humanDate(upper)
  return ''
}

export function dateToString (date) {
  return humanDate(date)
}

function humanDate (date) {
  if (date === null || date === undefined || date === '') {
    return ''
  }

  var split = date.split('-')
  if (!split[0].length && !split[1].length) return ''
  if (!split[0].length && split[1].length) {
    var bcYear = `-${split[1]}`
    return bcYear
  }
  var year = split[0]
  var month = split[1]
  if (!month) return year
  if (!month.length) return year
  if (month.match(/X/)) return year
  month = MONTHS[month]
  var day = split[2]
  if (!day) return `${month} ${year}`
  if (!day.length) return `${month} ${year}`
  if (day.match(/X/)) return `${month} ${year}`
  return `${day} ${month} ${year}`
}

export function intervalToDayMonthYear (interval) {
  if (interval === null) return ''

  var [lower, upper] = interval.split('/')
  if (lower.length && upper.length) {
    lower.replace(/ /g, '')
    upper.replace(/ /g, '')
    lower = dateToDayMonthYear(lower)
    upper = dateToDayMonthYear(upper)
    return [lower, upper]
  }

  if (lower.length) {
    lower.replace(/ /g, '')
    lower = dateToDayMonthYear(lower)
    return [lower, '']
  }
  if (upper.length) {
    upper.replace(/ /g, '')
    upper = dateToDayMonthYear(upper)
    return ['', upper]
  }
  return ''
}

function dateToDayMonthYear (date) {
  var split = date.split('-')

  var year = split[0]
  var month = split[1]
  if (!month || !month.length || month.match(/X/)) {
    year.replace(/X/g, '0')
    return `01-01-${year}`
  }
  var day = split[2]
  if (!day || !day.length || day.match(/X/)) {
    year.replace(/X/g, '0')
    return `01-${month}-${year}`
  }
  return `${day}-${month}-${year}`
}

export function yearMonthDay (interval) {
  if (interval === null) return ''
  const [lower, upper] = interval.split('/')
  if (lower.length && upper.length) {
    if (lower === upper) return `${yearMonthDayFormatter(lower)}`
    return `${yearMonthDayFormatter(lower)} - ${yearMonthDayFormatter(upper)}`
  }
  if (lower.length) return yearMonthDayFormatter(lower)
  if (upper.length) return yearMonthDayFormatter(upper)
  return ''
}

function yearMonthDayFormatter (date) {
  var split = date.split('-')
  if (!split[0].length && !split[1].length) return
  if (!split[0].length && split[1].length) {
    var bcYear = `-${split[1]}`
    return bcYear
  }
  var year = split[0]
  var month = split[1]
  if (!month) return year
  if (!month.length) return year
  if (month.match(/X/)) return year
  month = MONTHS[month]
  // var day = split[2]
  // if (!day) return `${year}-${month}`
  // if (!day.length) return `${year}-${month}`
  // if (day.match(/X/)) return `${year}-${month}`
  // return `${year} - ${month} ${day}`
  return `${year}-${month}`
}

/*
  takes an edtf date and returns a date string,
  this is so the Timeline component can sort the items by date
*/
export function edtfToDateString (dateStr) {
  if (dateStr === null || dateStr === '') return ''

  try {
    // get the date object
    const { upper, lower } = edtf(dateStr)
    var time = ''

    if (!lower && upper) time = upper
    else time = lower

    return time
  } catch (err) {
    // NOTE: if edtf fails, then it will be caught here
    console.error('There was an error with converting an edtfDateString', err)
  }
}

const MONTHS = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec'
}

export function convertDateObjToString (obj) {
  var { year, month, day } = obj

  var error

  if (year && month && day) return `${year}-${month}-${day}`
  if (year && month && !day) return `${year}-${month}`
  if (year && !month && !day) return `${year}`
  if (!year && !month && !day) return ''
  if (year && !month && day) {
    error = new Error('Please specify a month')
    error.metadata = { month: true }
  }
  if (!year && month && day) {
    error = new Error('Please specify a year')
    error.metadata = { year: true }
  }
  if (!year && !month && day) {
    error = new Error('Please specify a year and month')
    error.metadata = { year: true, month: true }
  }
  if (!year && month && !day) {
    error = new Error('Please specify a year')
    error.metadata = { year: true, day: true }
  }

  throw error
}

export function parseInterval (interval) {
  if (!interval || interval === '') return interval

  if (interval.indexOf('/') < 0) return '/'

  const [start, end] = interval.split('/')

  if (start === end) return '/' + end

  return interval
}

export function formatSubmissionDate (submittedDate) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Date format incorrect
  if (submittedDate === undefined ||
    submittedDate === '' ||
    submittedDate === null) {
    return ''
  }

  try {
    const bornDate = new Date(submittedDate)

    if (submittedDate.toString().length === 4) { // If only year passed, i.e. bornAt = '1990'
      return bornDate.getFullYear().toString()
    } else if (submittedDate.toString().length === 7) { // If only year and month passed, i.e. bornAt = '1990-01'
      return months[bornDate.getMonth()] + ' ' + bornDate.getFullYear()
    } else { // Full date passed, i.e. bornAt = '1990-01-28'
      return bornDate.getDate() + ' ' + months[bornDate.getMonth()] + ' ' + bornDate.getFullYear()
    }
  } catch (e) {
    console.error(e.message) // Invalid format of date string
  }
}

export function getBirthYear (aliveInterval) {
  if (!aliveInterval) return ''
  var split = aliveInterval.split('/')
  if (split[0] === '' || !split[0]) return ''
  if (aliveInterval !== '' && aliveInterval) return aliveInterval.substring(0, 4)
  return ''
}
