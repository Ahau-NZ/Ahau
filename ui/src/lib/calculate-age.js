import edtf from 'edtf'

export default function calculateAge (aliveInterval, now = new Date()) {
  if (!aliveInterval || aliveInterval === '/') return null

  var [start, end] = aliveInterval.split('/')
  var [year] = end.split('-')
  var addedOne = false

  if ((start === '' && end !== '') || start === end) {
    var newYear = parseInt(year) - 1
    aliveInterval = newYear + '/' + end
    addedOne = true
  }

  var diffMs = null
  var interval = edtf(aliveInterval)

  if (interval.lower && interval.upper) {
    diffMs = interval.upper.getTime() - interval.lower.getTime()
  } else if (interval.lower && !interval.upper) {
    diffMs = now.getTime() - interval.lower.getTime()
  } else if (!interval.lower && interval.upper) {
    return '0'
  }

  var ageDt = new Date(diffMs)
  var age = Math.abs(ageDt.getUTCFullYear() - 1970)
  if (addedOne) age -= 1
  return age
}
