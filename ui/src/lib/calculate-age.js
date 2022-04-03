import edtf from 'edtf'

export default function calculateAge (aliveInterval, now = new Date()) {
  if (!aliveInterval || aliveInterval === '/') return null

  const [start, end] = aliveInterval.split('/')
  const [year] = end.split('-')
  let addedOne = false

  // if no start date we cant calculate the age
  if (start === '') return null

  if (start === end) {
    const newYear = parseInt(year) - 1
    aliveInterval = newYear + '/' + end
    addedOne = true
  }

  let diffMs = null
  const interval = edtf(aliveInterval)

  if (interval.lower && interval.upper) {
    diffMs = interval.upper.getTime() - interval.lower.getTime()
  } else if (interval.lower && !interval.upper) {
    diffMs = now.getTime() - interval.lower.getTime()
  } else if (!interval.lower && interval.upper) {
    return '0'
  }

  const ageDt = new Date(diffMs)
  let age = Math.abs(ageDt.getUTCFullYear() - 1970)
  if (addedOne) age -= 1
  return age
}
