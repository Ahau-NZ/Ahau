import { action } from '@storybook/addon-actions'
import WhakapapaEditDialog from './WhakapapaEditDialog'
import { viewMinimum } from '@/mocks/whakapapa-view'
import VIEWPORTS from '../../../../.storybook/VIEWPORTS'

export default {
  title: 'WhakapapaEditDialog',
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

export const CompleteViewDialog = () => ({
  template:
    '<WhakapapaEditDialog :show="true" @close="close" :view="whakapapaView" Z/>',
  data: () => ({
    whakapapaView: viewMinimum
  }),
  methods: defaultMethods,
  close ($event) {
    console.log($event)
  },
  components: { WhakapapaEditDialog }
})
