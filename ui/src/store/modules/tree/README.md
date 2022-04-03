# tree layout

There are two fundamental units the whakapapa tree is made up of:
1. A nested tree of Subtree's made up at each level of
    - a `rootNode`, which is the central node that d3 has positioned
    - `partners`, which are nodes we manually position either side of the rootNode
    - `children`, which are nodes positioned by d3, which form the rootNode of their own Subtree
    - links of type:
        - `partnerLinks` which connect a `rootNode` to a `partner`
            - (may in future run from `partner` to `partner`
        - `childLinks` which connect a "parents" (`rootNode` or `partner`) to a `child`
            - soloLink - run from a single parent to child
            - multiLink - run from the midpoint of 2 parents to a `child`
2. Secondary Links
    - typically childLinks which tell more info about an adopted/ whangai relationship
    - drawn as the final step, as we need all other nodes to be drawn first, as these can traverse multiple levels / branches of a graph


## Partner Layout

The algorithm for laying out partners is:
- we aim to have an equal number of partners either side of the rootNode
- if there is an odd number, we prioritise the **left**
- we sort the partners based on the position of `children`
    - aim is to get each partner closer to the most of it's **birth children**
        - we only look at birth children position because it seems to work better when 
          there are also whangai/ adopted children
    - child order is influenced (upstream) by `profile.birthOrder || profile.age`

IMPORTANT: **equal partners either side** + **left priority** are rules which allow
us to guarenttee no overlap betwen siblings partners, and also calculate a tighter spacing.
(See Node Seperation below)

Constants:
- `PARTNER_SPACE` defines the horizontal distance
    - between the edges of each rootNode + partner
    - between a partner and the next partner


```
                             _
               A-----B=====( R )-----C
                        |    -    |
                        |      +--+--+
                        |      |     |
                        br     rc1  rc2
                        
```
_R = rooNode, A,B,C = partners, br = child of B,R etc_

NOTE: I think partners without any childLinks (e.g. A) will be sorted _towards the graph center_
as we currently count the mean child position for them as `0` (which may put them to the left or
right depending on where this Subtree is relative to `(0, 0)`)


## Node Seperation

see `tree/index.js` :
```js
  return d3Tree()
    .nodeSize([NODE_SIZE_X, NODE_SIZE_Y])
    .separation((a, b) => {

```

This function defines the distance placed between nodes. It takes two nodes and expects you to
return a number which represents what to scale `NODE_SIZE_X` by to calculate spacing.
(i.e. if you return 1, you'll get normal sibling space [if they have no partners])


- siblings
    - we can tell if two nodes are siblings because `node.parent` is the same for each of them (Note, each rootNode only has one parent, and it's not necessarily a birth parent it's just the node it's udner)
    - how we space them depends on their partners
    - we figure out which of `a, b` is on the left, which the right, then figure out how many partners need to fit between them
        - we only know this because of how we define Patner Layout (see above)
    - so we need `partnersBetween * spaceForAPartner * SIBLING_SPACE` spacing

- other/ cousins
    - if they're not siblings we're probably comparing cousins
    - ... so `partnersBetween * spaceForAPartner * COUSIN_SPACE` spacing
        - > mix: less clear if this is the right sort of equation, but seems to work?

Constants:
- `SIBLING_SPACE` - the space between each two siblings areas (area = rootNode + partners)
- `COUSIN_SPACE` - the space between each two non-sibling areas

## Things to watch out for

The `nestedDescendants` we get from `vuex/whakapapa` is a graph of what should be drawn. This is changed based on state like:
    - `ignoredProfiles`
    - `importantRelationships`
    - `collapsed`
    - `showExtendedFamily`

"Children" and "Parents" get used to mean a couple of different things in this context:
- the `relationshipType` sense _e.g. B is a birth **child** of A_
- the `graph` sense _e.g. B is a **child** of node A - they are a birth child A's partner from a past marriage...._

