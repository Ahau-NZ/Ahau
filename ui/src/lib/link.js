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
                  |
    (branch) _____|
            |
            |
      (endX, endY)

*/
function path ({ startX, startY, endX, endY }, branch) {
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
      return '#' + ((i + 12) * 89).toString(16) // NOTE: change link colors here
    }
  },
  partner: {
    spacing: {
      x: 0, // TODO (later): set tree separation to use this value
      y: 5
    }
  },
  opacity: 0.3,
  thickness: 5,
  branch: 120,
  radius: 50
}
