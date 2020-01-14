import NewNodeDialog from './NewNodeDialog.vue'
import { action } from '@storybook/addon-actions'

export default {
  title: 'NewNodeDialog'
}
export const CompleteProfile = () => ({
  template: `<NewNodeDialog :show="true" @close="close" @submit="submit($event)"/>`,
  methods: {
    submit ($event) {
      console.log($event)
    },
    close: action('close')
  },
  components: { NewNodeDialog }
})
