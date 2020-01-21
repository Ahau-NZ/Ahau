import Tree from './Tree.vue'
import { personMinimum, personComplete, personNoImages } from '@/mocks/person-profile.js'

export default {
  title: 'Tree'
}

export const TreeWithChildren = () => ({
  template: '<Tree :nestedWhakapapa="nestedWhakapapa" :view="whakapapaView" :profiles="profiles"/>',
  data: () => ({
    nestedWhakapapa: personComplete,
    whakapapaView: {
      name: 'Tree With Children',
      description: 'This is a tree with children'
    },
    profiles: {}
  }),
  components: { Tree }
})

export const TreeWithoutChildren = () => ({
  template: '<Tree :nestedWhakapapa="nestedWhakapapa" :view="whakapapaView" :profiles="profiles"/>',
  data: () => ({
    nestedWhakapapa: personMinimum,
    whakapapaView: {
      name: 'Tree Without Children',
      description: 'This is a tree without children'
    },
    profiles: {}
  }),
  components: { Tree }
})

export const TreeWithoutImages = () => ({
  template: '<Tree :nestedWhakapapa="nestedWhakapapa" :view="whakapapaView" :profiles="profiles"/>',
  data: () => ({
    nestedWhakapapa: personNoImages,
    whakapapaView: {
      name: 'Tree Without Images',
      description: 'This is a tree without images -  therefore I should default images instead'
    },
    profiles: {}
  }),
  components: { Tree }
})
