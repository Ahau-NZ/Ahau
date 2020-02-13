import { action } from '@storybook/addon-actions'
import AvatarEditDialog from './AvatarEditDialog'
import { personComplete } from '@/mocks/person-profile'
import VIEWPORTS from '../../../.storybook/VIEWPORTS'

export default {
  title: 'AvatarEditDialog',
  parameters: {
    viewport: {
      defaultViewport: 'extra_small',
      viewports: VIEWPORTS
    }
  }
}

const defaultMethods = {
  close: action('toggle view'),
  submit: console.log('Submit')
}

export const withImage = () => ({
  template:
    '<AvatarEditDialog :show="true" :avatarImage="avatarImage" :round="true" @submit="submit" @close="close"/>',
  data: () => ({
    avatarImage: personComplete.avatarImage.uri
  }),
  methods: defaultMethods,
  components: { AvatarEditDialog }
})
