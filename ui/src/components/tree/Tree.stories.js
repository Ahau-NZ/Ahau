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
    }
  ]
}

const relationshipLinks = new Map()

const r1 = tree.getRelationship(stacey, cherese, { linkId: 'A-B', relationshipType: 'birth' })
const r2 = tree.getRelationship(stacey, zavien, { linkId: 'A-D', relationshipType: 'birth' })
relationshipLinks.set(r1.index, r1.attrs)
relationshipLinks.set(r2.index, r1.attrs)

export const OnePartner = () => ({
  template: '<Tree />',
  components: { Tree },
  store: {
    getters: {
      nestedWhakapapa: onePartner,
      relationshipLinks
    },
    state: {
      whakapapa: {
        nestedWhakapapa: onePartner,
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
      nestedWhakapapa: twoPartners,
      relationshipLinks
    },
    state: {
      whakapapa: {
        nestedWhakapapa: twoPartners,
        relationshipLinks
      }
    }
  }
})
