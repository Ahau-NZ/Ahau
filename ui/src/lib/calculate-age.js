import edtf from 'edtf'

export default function calculateAge (aliveInterval, now = new Date()) {
  if (!aliveInterval || aliveInterval === '/') return null

  var interval = edtf(aliveInterval)
  var diffMs = null

  if (interval.lower && interval.upper) {
    diffMs = interval.upper.getTime() - interval.lower.getTime()
  } else if (interval.lower && !interval.upper) {
    diffMs = now.getTime() - interval.lower.getTime()
  } else if (!interval.lower && interval.upper) {
    return null
  }

  var ageDt = new Date(diffMs)
  var age = Math.abs(ageDt.getUTCFullYear() - 1970)
  return age
}
