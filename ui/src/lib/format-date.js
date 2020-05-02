export default function formatDate (bornAt) {
  const months = ['Jan', 'Feb', 'Mar','Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let bornDate = new Date(bornAt)
  let formattedDate = bornDate.getDate() + " " + months[bornDate.getMonth()] + " " + bornDate.getFullYear()
  return formattedDate
}
