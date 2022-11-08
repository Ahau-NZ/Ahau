import NewPersonDialog from './NewPersonDialog.vue'
import VIEWPORTS from '../../../../.storybook/VIEWPORTS'

export default {
  title: 'NewPersonDialog',
  parameters: {
    viewport: {
      defaultViewport: 'extra_small',
      viewports: VIEWPORTS
    }
  }
}

export const defaultDialog = () => ({
  template: '<NewPersonDialog :show="true" @submit="submit($event)"/>',
  components: { NewPersonDialog },
  methods: {
    submit ($event) {
      console.log($event)
    }
  }
})

export const customTitle = () => ({
  template: '<NewPersonDialog :show="true" title="Add a child of Willard"/>',
  components: { NewPersonDialog }
})

export const withoutRelationships = () => ({
  template: '<NewPersonDialog :show="true" :withtRelationships="false" />',
  components: { NewPersonDialog }
})
