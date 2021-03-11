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

const DEFAULT_STYLE = {
  fill: 'none',
  stroke: 'grey',
  opacity: 0.3,
  strokeWidth: 5
}

const RANDOM_STYLE = () => {
  return {
    fill: 'none',
    stroke: randomColor(),
    opacity: 0.3,
    strokeWidth: 5
  }
}

export default {
  path,
  style: {
    default: DEFAULT_STYLE,
    random: RANDOM_STYLE
  }
}

function randomColor () {
  return '#' + Math.random().toString(16).substr(2, 6)
}
