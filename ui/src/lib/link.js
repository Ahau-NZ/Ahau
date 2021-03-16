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

export default {
  path,
  color: {
    default: 'grey',
    getRandomColor: randomColor
  },
  partner: {
    spacing: {
      x: 0,
      y: 5
    }
  },
  opacity: 0.3,
  thickness: 5,
  branch: 120,
  radius: 50
}
