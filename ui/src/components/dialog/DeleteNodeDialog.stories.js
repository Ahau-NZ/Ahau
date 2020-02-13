import { action } from '@storybook/addon-actions'
import DeleteNodeDialog from './DeleteNodeDialog'
import { personComplete } from '@/mocks/person-profile'
import VIEWPORTS from '../../../.storybook/VIEWPORTS'

export default {
  title: 'DeleteNodeDialog',
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
  template:
    '<DeleteNodeDialog :show="true" :profile="profile" @close="close" @submit="close"/>',
  data: () => ({
    profile: personComplete
  }),
  methods: defaultMethods,
  components: { DeleteNodeDialog }
})

export const withoutWarnAboutChildren = () => ({
  template:
    '<DeleteNodeDialog :show="true" :profile="profile" :warnAboutChildren="false" @close="close" @submit="close"/>',
  data: () => ({
    profile: personComplete
  }),
  methods: defaultMethods,
  components: { DeleteNodeDialog }
})
