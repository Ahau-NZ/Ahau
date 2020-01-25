import NewNodeDialog from './NewNodeDialog.vue'
import { action } from '@storybook/addon-actions'

export default {
  title: 'NewNodeDialog'
}

export const defaultDialog = () => ({
  template: `<NewNodeDialog :show="true" @submit="log($event)"/>`,
  components: { NewNodeDialog },
  methods: {
    log ($event) {
      console.log($event)
    }
  }
})

export const addAChild = () => ({
  template: `<NewNodeDialog :show="true" type="child" title="Willard"/>`,
  components: { NewNodeDialog }
})

export const addAParent = () => ({
  template: `<NewNodeDialog :show="true" type="parent" title="Willard"/>`,
  components: { NewNodeDialog }
})
