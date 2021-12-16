import { linkColours } from '../lib/colours'

/*

  use with <path></path> d attribute
  M = moveto
  v = vertical lineto (relative)
  H = horizontal lineto
  V = vertical lineto (absolute)

  example:

          (startX, startY)
                  |
                  |
    (branch) _____|
            |
            |
            |
      (endX, endY)

*/
function path ({ startX, startY, endX, endY, directed = true }, branch) {
  branch = branch || (endY - startY) / 2

  // special case for when startY and endY are the same
  /*
               ____________________
               |                  |
   startX, startY            endX, endY
(parent) x     |                  x (child)
         |_____|

  */

  if (directed && startY === endY) {
    const offset = 80
    return `
      M ${startX}, ${startY}
      v ${offset}
      H ${startX + (startX < endX ? offset : -offset)}
      v ${-2 * offset}
      H ${endX}
      V ${endY}  
    `
  }

  return `
    M ${startX}, ${startY}
    v ${branch}
    H ${endX}
    V ${endY}
  `
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
