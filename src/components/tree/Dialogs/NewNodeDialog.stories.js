import NewNodeDialog from './NewNodeDialog.vue'
import NewNodeDialog2 from './NewNodeDialog2.vue'
import { action } from '@storybook/addon-actions'

export default {
  title: 'NewNodeDialog'
}

export const defaultDialog = () => ({
  template: `<NewNodeDialog2 :show="true"/>`,
  components: { NewNodeDialog2 }
})

export const addAChild = () => ({
  template: `<NewNodeDialog :show="true" type="child" title="Willard"/>`,
  components: { NewNodeDialog }
})

export const addAParent = () => ({
  template: `<NewNodeDialog :show="true" type="parent" title="Willard"/>`,
  components: { NewNodeDialog }
})
