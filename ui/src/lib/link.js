import { linkColours } from '../lib/colours'

/*

  use with <path></path> d attribute
  M = moveto
  v = vertical lineto (relative)
  V = vertical lineto (absolute)
  H = horizontal lineto

*/
function path ({ startX, startY, endX, endY, directed = true }, branch) {
  // special case for when startY and endY are the same
  /*
               ____________________
               |                  |
   startX, startY            endX, endY
(parent) x     |                  x (child)
         |_____|

  */
  if (directed && startY === endY) {
    const offset = 85 // TODO derive this from RADIUS?
    return `M ${startX}, ${startY} v ${offset} H ${startX + (startX < endX ? offset : -offset)} v ${-2 * offset} H ${endX} V ${endY}`
  }

  // general case
  /*      (startX, startY)
                  |
                  |
    (branch) _____|
            |
            |
            |
      (endX, endY)
  */
  branch = branch == null ? (endY + startY) / 2 : branch // absolute height

  /* square */
  return `M ${startX}, ${startY} V ${branch} H ${endX} V ${endY}`

  /* straight down to branch, bezier curve down to child */
  // return `M ${startX}, ${startY} V ${branch} C ${endX} ${branch} ${endX} ${branch} ${endX} ${endY}`

  /* better curve */
  // const radius = Math.min(
  //   endY - 50 - branch, // 50 is RADIUS of rootNode
  //   Math.abs(endX - startX)
  // )
  // return `
  //   M ${startX}, ${startY}
  //   V ${branch}
  //   H ${endX + (startX > endX ? +1 : -1) * radius}
  //   A ${radius} ${radius} 0 0 ${startX > endX ? 0 : 1} ${endX} ${endY - 50}
  //   V ${endY}
  // `
}

function randomColor () {
  return '#' + Math.random().toString(16).substr(2, 6)
}

// TODO (later): move these settings into vuex where the tree style can be manipulated there
export default {
  path,
  color: {
    default: 'grey',
    getRandomColor: randomColor,
    getColor (i) {
      if (i < 7) return linkColours[i]
      return '#' + ((i + 10) * 89).toString(16) // NOTE: change link colors here
    }
  },
  partner: {
    spacing: {
      x: 0, // TODO (later): set tree separation to use this value
      y: 5 // set to same as thickness
    }
  },
  opacity: 1,
  thickness: 1.5,
  branch: 110,
  radius: 50
}
