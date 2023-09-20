import edtf from 'edtf'

export function dateIntervalToString (interval, t) {
  if (interval === null) return ''

  const [lower, upper] = interval.split('/')
  if (lower.length && upper.length) {
    if (lower === upper) return `${humanDate(lower, t)}`
    return `${humanDate(lower, t)} - ${humanDate(upper, t)}`
  }
  if (lower.length) return humanDate(lower, t)
  if (upper.length) return humanDate(upper, t)
  return ''
}

export function dateToString (date, t) {
  return humanDate(date, t)
}

function humanDate (date, t) {
  if (date === null || date === undefined || date === '') {
    return ''
  }

  const split = date.split('-')
  if (!split[0].length && !split[1].length) return ''
  if (!split[0].length && split[1].length) {
    const bcYear = `-${split[1]}`
    return bcYear
  }
  const year = split[0]
  let month = split[1]
  if (!month) return year
  if (!month.length) return year
  if (month.match(/X/)) return year
  month = t(MONTHS[month])
  const day = split[2]
  if (!day) return `${month} ${year}`
  if (!day.length) return `${month} ${year}`
  if (day.match(/X/)) return `${month} ${year}`
  return `${day} ${month} ${year}`
}

export function intervalToDayMonthYear (interval) {
  if (interval === null) return ''

  let [lower, upper] = interval.split('/')
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
  const split = date.split('-')

  const year = split[0]
  const month = split[1]
  if (!month || !month.length || month.match(/X/)) {
    year.replace(/X/g, '0')
    return `01-01-${year}`
  }
  const day = split[2]
  if (!day || !day.length || day.match(/X/)) {
    year.replace(/X/g, '0')
    return `01-${month}-${year}`
  }
  return `${day}-${month}-${year}`
}

export function yearMonthDay (interval, t) {
  if (interval === null) return ''
  const [lower, upper] = interval.split('/')
  if (lower.length && upper.length) {
    if (lower === upper) return `${yearMonthDayFormatter(lower, t)}`
    return `${yearMonthDayFormatter(lower, t)} - ${yearMonthDayFormatter(upper, t)}`
  }
  if (lower.length) return yearMonthDayFormatter(lower, t)
  if (upper.length) return yearMonthDayFormatter(upper, t)
  return ''
}

function yearMonthDayFormatter (date, t) {
  const split = date.split('-')
  if (!split[0].length && !split[1].length) return
  if (!split[0].length && split[1].length) {
    const bcYear = `-${split[1]}`
    return bcYear
  }
  const year = split[0]
  let month = split[1]
  if (!month) return year
  if (!month.length) return year
  if (month.match(/X/)) return year
  month = t(MONTHS[month])
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
    const { max, min } = edtf(dateStr)

    if (min) return new Date(min)
    else {
      const d = new Date(max) // this is the end of the day
      const year = d.getUTCFullYear()
      const month = d.getUTCMonth() + 1
      const day = d.getUTCDate()
      return new Date(`${year}-${month < 10 ? '0' : ''}${month}-${day}`)

      // NOTE new Date(1999, 1, 14) !== new Date('1999-02-14')
      // one is set assuming UTC time, the othee your local time T_T
    }
  } catch (err) {
    // NOTE: if edtf fails, then it will be caught here
    console.error('There was an error with converting an edtfDateString', err)
  }
}

const MONTHS = {
  '01': 'jan',
  '02': 'feb',
  '03': 'mar',
  '04': 'apr',
  '05': 'may',
  '06': 'jun',
  '07': 'jul',
  '08': 'aug',
  '09': 'sep',
  10: 'oct',
  11: 'nov',
  12: 'dec'
}

export function convertDateObjToString (obj) {
  const { year, month, day } = obj

  let error

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

export function formatSubmissionDate (submittedDate, t) {
  const months = [
    t('jan'),
    t('feb'),
    t('mar'),
    t('apr'),
    t('may'),
    t('jun'),
    t('jul'),
    t('aug'),
    t('sep'),
    t('oct'),
    t('nov'),
    t('dec')
  ]

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
  const split = aliveInterval.split('/')
  if (split[0] === '' || !split[0]) return ''
  if (aliveInterval !== '' && aliveInterval) return aliveInterval.substring(0, 4)
  return ''
}
