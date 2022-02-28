import Tree from './Tree.vue'
import tree from '@/lib/tree-helpers.js'

export default {
  title: 'Tree'
}

const stacey = { id: 'A', preferredName: 'Stacey', gender: 'male' }
const cherese = { id: 'B', preferredName: 'Cherese' }
const claudine = { id: 'C', preferredName: 'Claudine' }
const zavien = { id: 'D', preferredName: 'Zavien', gender: 'male' }
const susan = { id: 'E', preferredName: 'Susan' }

const onePartner = {
  ...stacey,
  children: [
    {
      ...cherese,
      parents: [
        claudine,
        stacey
      ]
    }
  ],
  partners: [
    {
      ...claudine,
      children: [
        cherese
      ],
      partners: [
        stacey
      ]
    }
  ]
}

const twoPartners = {
  ...stacey,
  children: [
    {
      ...cherese,
      parents: [
        claudine,
        stacey
      ]
    },
    {
      ...zavien,
      parents: [
        stacey,
        susan
      ]
    },
    {
      id: 'H',
      preferredName: 'Zara',
      children: [{ id: 'I', preferredName: 'Otene', gender: 'male' }],
      partners: [{ id: 'J', preferredName: 'Makene', gender: 'male' }]
    }
  ],
  partners: [
    {
      ...claudine,
      children: [
        cherese
      ]
    },
    {
      ...susan,
      children: [
        zavien
      ]
    },
    {
      id: 'F',
      preferredName: 'F'
    },
    {
      id: 'G',
      preferredName: 'G'
    }
  ]
}

const relationshipLinks = new Map()

const r1 = tree.getRelationship(stacey, cherese, { linkId: 'A-B', relationshipType: 'birth' })
const r2 = tree.getRelationship(stacey, zavien, { linkId: 'A-D', relationshipType: 'birth' })
const r3 = tree.getRelationship(stacey, { id: 'H' }, { linkId: 'A-H', relationshipType: 'birth' })
const r4 = tree.getRelationship({ id: 'H' }, { id: 'I' }, { linkId: 'H-I', relationshipType: 'birth' })

relationshipLinks.set(r1.index, r1.attrs)
relationshipLinks.set(r2.index, r2.attrs)
relationshipLinks.set(r3.index, r3.attrs)
relationshipLinks.set(r4.index, r4.attrs)

export const OnePartner = () => ({
  template: '<Tree />',
  components: { Tree },
  store: {
    getters: {
      nestedDescendants: onePartner,
      relationshipLinks
    },
    state: {
      whakapapa: {
        nestedDescendants: onePartner,
        relationshipLinks
      }
    }
  }
})

export const TwoPartners = () => ({
  template: '<Tree />',
  components: { Tree },
  store: {
    getters: {
      nestedDescendants: twoPartners,
      relationshipLinks
    },
    state: {
      whakapapa: {
        nestedDescendants: twoPartners,
        relationshipLinks
      }
    }
  }
})
