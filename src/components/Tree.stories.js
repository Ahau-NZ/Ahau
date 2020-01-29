import { action } from '@storybook/addon-actions'
import Tree from './Tree.vue'
import { personMinimum, personComplete, personNoImages } from '@/mocks/person-profile.js'

export default {
  title: 'Tree'
}

export const TreeWithChildren = () => ({
  template: `
    <Tree :nestedWhakapapa="nestedWhakapapa" :view="whakapapaView"
      @open-context-menu="menuClick"
      @load-descendants="loadDescendents"
      @collapse-node="collapseNode"
    />
  `,
  data: () => ({
    nestedWhakapapa: personComplete,
    whakapapaView: {
      name: 'Tree With Children',
      description: 'This is a tree with children'
    }
  }),
  methods: {
    menuClick: action('open-context-menu'),
    loadDescendents: action('load-descendants'),
    collapseNode: action('collapse-node')
  },
  components: { Tree }
})

export const TreeWithoutChildren = () => ({
  template: '<Tree :nestedWhakapapa="nestedWhakapapa" :view="whakapapaView" />',
  data: () => ({
    nestedWhakapapa: personMinimum,
    whakapapaView: {
      name: 'Tree Without Children',
      description: 'This is a tree without children'
    }
  }),
  components: { Tree }
})

export const TreeWithoutImages = () => ({
  template: '<Tree :nestedWhakapapa="nestedWhakapapa" :view="whakapapaView" />',
  data: () => ({
    nestedWhakapapa: personNoImages,
    whakapapaView: {
      name: 'Tree Without Images',
      description: 'This is a tree without images -  therefore I should default images instead'
    }
  }),
  components: { Tree }
})
