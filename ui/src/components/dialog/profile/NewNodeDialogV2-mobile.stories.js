import NewNodeDialogV2 from './NewNodeDialogV2.vue'
import { action } from '@storybook/addon-actions'
import VIEWPORTS from '../../../../.storybook/VIEWPORTS'

export default {
  title: 'NewNodeDialogV2 Mobile',
  parameters: {
    viewport: {
      defaultViewport: 'extra_small',
      viewports: VIEWPORTS
    }
  }
}

export const defaultDialog = () => ({
  template: '<NewNodeDialogV2 :show="true" @submit="submit"/>',
  components: { NewNodeDialogV2 },
  methods: {
    submit: action('submit')
  }
})

export const customTitle = () => ({
  template: '<NewNodeDialogV2 :show="true" title="KO WAI AU ---- WHO AM I"/>',
  components: { NewNodeDialogV2 }
})

export const withoutRelationships = () => ({
  template: '<NewNodeDialogV2 :show="true" :withtRelationships="false" />',
  components: { NewNodeDialogV2 }
})
