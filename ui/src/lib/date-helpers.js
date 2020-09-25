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
  var day = split[2]
  if (!day) return `${month} ${year}`
  if (!day.length) return `${month} ${year}`
  if (day.match(/X/)) return `${month} ${year}`
  return `${day} ${month} ${year}`
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
    console.log('bcYear:', bcYear)
    return bcYear
  }
  var year = split[0]
  var month = split[1]
  if (!month) return year
  if (!month.length) return year
  if (month.match(/X/)) return year
  month = MONTHS[month]
  var day = split[2]
  if (!day) return `${year} - ${month}`
  if (!day.length) return `${year} - ${month}`
  if (day.match(/X/)) return `${year} - ${month}`
  // return `${year} - ${month} ${day}`
  return `${year} - ${month}`
}

export function convertToTime (date) {
  const lower = date.split('/')
  var time = new Date(lower)
  return time
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
  '09': 'Sept',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec'
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
