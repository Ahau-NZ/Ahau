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
  if (!split[0].length) return
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
