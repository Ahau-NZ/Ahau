import { action } from '@storybook/addon-actions'
import CsvHelperDialog from './CsvHelperDialog'
import VIEWPORTS from '../../../../.storybook/VIEWPORTS'

export default {
  title: 'CsvHelperDialog',
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
  template: '<CsvHelperDialog :show="true" @close="close" @submit="close"/>',
  methods: defaultMethods,
  components: { CsvHelperDialog }
})
