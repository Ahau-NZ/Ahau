export default function formatDate (bornAt) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Date passed as an empty string or no date passed
  if (bornAt === '') {
    throw new Error('Cannot format an empty string')
  }
  if (bornAt === undefined) {
    throw new Error('Cannot format an undefined value')
  }

  try {
    const bornDate = new Date(bornAt)

    if (bornAt.toString().length === 4) { // If only year passed, i.e. bornAt = '1990'
      return bornDate.getFullYear().toString()
    } else if (bornAt.toString().length === 7) { // If only year and month passed, i.e. bornAt = '1990-01'
      return months[bornDate.getMonth()] + ' ' + bornDate.getFullYear()
    } else { // Full date passed, i.e. bornAt = '1990-01-28'
      return bornDate.getDate() + ' ' + months[bornDate.getMonth()] + ' ' + bornDate.getFullYear()
    }
  } catch (e) {
    console.error(e.message) // Invalid format of date string
  }
}
