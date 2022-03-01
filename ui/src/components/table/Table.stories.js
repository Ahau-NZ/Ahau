import { action } from '@storybook/addon-actions'
import Table from './Table.vue'
import {
  personMinimum,
  personComplete,
  personNoImages
} from '@/mocks/person-profile.js'

export default {
  title: 'Table'
}

export const TableWithChildren = () => ({
  template: `
    <Table :nestedDescendants="nestedDescendants" :view="whakapapaView"
      @collapse-node="collapseNode"
    />
  `,
  data: () => ({
    nestedDescendants: personComplete,
    whakapapaView: {
      name: 'Table With Children',
      description: 'This is a Table with children'
    }
  }),
  methods: {
    collapseNode: action('collapse-node')
  },
  components: { Table }
})

export const TableWithoutChildren = () => ({
  template: '<Table :nestedDescendants="nestedDescendants" :view="whakapapaView" />',
  data: () => ({
    nestedDescendants: personMinimum,
    whakapapaView: {
      name: 'Table Without Children',
      description: 'This is a Table without children'
    }
  }),
  components: { Table }
})

export const TableWithoutImages = () => ({
  template: '<Table :nestedDescendants="nestedDescendants" :view="whakapapaView" />',
  data: () => ({
    nestedDescendants: personNoImages,
    whakapapaView: {
      name: 'Table Without Images',
      description:
        'This is a Table without images -  therefore I should default images instead'
    }
  }),
  components: { Table }
})
