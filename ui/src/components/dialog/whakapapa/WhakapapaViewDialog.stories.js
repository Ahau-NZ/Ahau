import { action } from '@storybook/addon-actions'
import WhakapapaViewDialog from './WhakapapaViewDialog'
import { viewMinimum } from '@/mocks/whakapapa-view'
import VIEWPORTS from '../../../../.storybook/VIEWPORTS'

export default {
  title: 'WhakapapaViewDialog',
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
    '<WhakapapaViewDialog :show="true" @close="close" :view="whakapapaView" Z/>',
  data: () => ({
    whakapapaView: viewMinimum
  }),
  methods: defaultMethods,
  close ($event) {
    console.log($event)
  },
  components: { WhakapapaViewDialog }
})
