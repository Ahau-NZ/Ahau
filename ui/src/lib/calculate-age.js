export default function calculateAge (bornAt, now = new Date()) {
  if (bornAt === null) return bornAt
  var diffMs = now.getTime() - new Date(bornAt).getTime()
  var ageDt = new Date(diffMs)
  var age = Math.abs(ageDt.getUTCFullYear() - 1970)
  return age
}
