export const RADIUS = 50 // radius of a rootNode
export const PARTNER_RADIUS = 0.7 * RADIUS // radius of a partnerNode
export const PARTNER_SPACE = 40 // space to put between rootNode + partnerNodes
// NOTE this spacing, matches these radii well - for small families with 2 parents, the child links are nicely aligned

export const SIBLING_SPACE = 50
// minimum horizontal space between sibling nodes
// recommend SIBLING_SPACE > PARTNER_SPACE

export const COUSIN_SPACE = 80
// minimum horizontal space between "cousin" nodes (not partners/ siblings)
// recommend COUSIN_SPACE > SIBLING_SPACE

export const NODE_SIZE_X = RADIUS + SIBLING_SPACE + RADIUS
// minimum horizontal space each node takes up
// NOTE - nodeSeperation function increases this depending on partners

export const NODE_SIZE_Y = 200
// vertical space between nodes
