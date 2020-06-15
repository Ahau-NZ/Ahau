import NewNodeDialog from './NewNodeDialog.vue'
import { action } from '@storybook/addon-actions'
import VIEWPORTS from '../../../../.storybook/VIEWPORTS'

export default {
  title: 'NewNodeDialog',
  parameters: {
    viewport: {
      defaultViewport: 'extra_small',
      viewports: VIEWPORTS
    }
  }
}

export const defaultDialog = () => ({
  template: '<NewNodeDialog :show="true" @submit="submit($event)"/>',
  components: { NewNodeDialog },
  methods: {
    submit ($event) {
      console.log($event)
    }
  }
})

export const customTitle = () => ({
  template: '<NewNodeDialog :show="true" title="Add a child of Willard"/>',
  components: { NewNodeDialog }
})

export const withoutRelationships = () => ({
  template: '<NewNodeDialog :show="true" :withtRelationships="false" />',
  components: { NewNodeDialog }
})
