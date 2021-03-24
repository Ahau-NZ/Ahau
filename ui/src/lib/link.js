import get from 'lodash.get'
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

function visiblePartners (node) {
  return get(node, 'data.isCollapsed')
    ? 0
    : get(node, 'data.partners.length', 0)
}

function leftPartnersCount (node) {
  return sideCount(node, -1)
}

function rightPartnersCount (node) {
  return sideCount(node, 1)
}

function sideCount (node, direction) {
  const len = visiblePartners(node)

  if (len === 0) return 0
  if (len === 1) return 0.8

  const mid = halfwayPoint(len)

  return node.data.partners
    .filter((d, i) => {
      var sign = i >= mid ? 1 : -1

      return sign === direction
    })
    .length
}

function halfwayPoint (len) {
  return len % 2 === 0
    ? len / 2
    : Math.round(len / 2) - 1
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
      y: 3 // set to same as thickness
    }
  },
  opacity: 0.8,
  thickness: 3,
  branch: 120,
  radius: 50,
  separation: {
    leftPartnersCount,
    rightPartnersCount
  }
}
