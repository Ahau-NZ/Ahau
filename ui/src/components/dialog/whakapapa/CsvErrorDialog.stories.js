import { action } from '@storybook/addon-actions'
import CsvErrorDialog from './CsvErrorDialog'
import VIEWPORTS from '../../../../.storybook/VIEWPORTS'

export default {
  title: 'CsvErrorDialog',
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
  template: '<CsvErrorDialog :show="true" :errorMsgs="errors" @close="close"/>',
  methods: defaultMethods,
  data () {
    return {
      errors: [
        { row: 1, field: 'parentNumber', msg: 'the first parentNumber must be left empty' }
      ]
    }
  },
  components: { CsvErrorDialog }
})
