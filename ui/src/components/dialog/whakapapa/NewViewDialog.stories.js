import { action } from '@storybook/addon-actions'
import NewViewDialog from './NewViewDialog'
import VIEWPORTS from '../../../../.storybook/VIEWPORTS'

export default {
  title: 'NewViewDialog',
  parameters: {
    viewport: {
      defaultViewport: 'extra_small',
      viewports: VIEWPORTS
    }
  }
}

const defaultMethods = {
  close: action('toggle view')
}

export const defaultDialog = () => ({
  template: '<NewViewDialog :show="true" @close="close" @submit="close"/>',
  methods: defaultMethods,
  components: { NewViewDialog }
})
