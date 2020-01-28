import NewNodeDialog from './NewNodeDialog.vue'
import { action } from '@storybook/addon-actions'

export default {
  title: 'NewNodeDialog'
}

export const defaultDialog = () => ({
  template: `<NewNodeDialog :show="true" @submit="submit"/>`,
  components: { NewNodeDialog },
  methods: {
    submit: action('submit')
  }
})

export const customTitle = () => ({
  template: `<NewNodeDialog :show="true" title="Add a child of Willard"/>`,
  components: { NewNodeDialog }
})

export const withoutRelationships = () => ({
  template: `<NewNodeDialog :show="true" :withtRelationships="false" />`,
  components: { NewNodeDialog }
})
