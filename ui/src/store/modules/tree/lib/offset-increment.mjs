// this assumes
// - we start placing nodes on the left
// - we have an even number left/right
// - we only need to set offset so that lines on left don't collide with those on left
//     (and likewise for  right)

export default function offsetIncrement (i, totalPartners) {
  if (totalPartners % 2 === 0) {
    if (i < totalPartners / 2) return i
    else return i - totalPartners / 2
  } else {
    if (i < totalPartners / 2) return i
    else return i - (totalPartners + 1) / 2
  }
}
