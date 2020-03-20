import DialogHandler from './DialogHandler.vue'
import {
  personComplete
} from '@/mocks/person-profile'
import { viewMinimum } from '@/mocks/whakapapa-view'
import VIEWPORTS from '../../../.storybook/VIEWPORTS'

export default {
  title: 'DialogHandler',
  parameters: {
    viewport: {
      defaultViewport: 'extra_small',
      viewports: VIEWPORTS
    }
  }
}

export const NoDialog = () => ({
  template:
    '<DialogHandler />',
  components: { DialogHandler }
})

export const ShowNewNodeDialog = () => ({
  template:
    '<DialogHandler dialog="new-node"/>',
  components: { DialogHandler }
})

export const ShowViewEditNodeDialog = () => ({
  template:
    '<DialogHandler :dialog="type" :selectedProfile="profileComplete" @update="type = $event"/>',
  data () {
    return {
      type: 'view-edit-node',
      profileComplete: personComplete
    }
  },
  components: { DialogHandler }
})

export const ShowDeleteNodeDialog = () => ({
  template:
    '<DialogHandler dialog="delete-node" :selectedProfile="profileComplete"/>',
  data () {
    return {
      profileComplete: personComplete
    }
  },
  components: { DialogHandler }
})

export const ShowWhakapapaViewDialog = () => ({
  template:
    '<DialogHandler dialog="whakapapa-view" :view="whakapapaView"/>',
  data () {
    return {
      whakapapaView: viewMinimum
    }
  },
  components: { DialogHandler }
})

export const ShowWhakapapaEditDialog = () => ({
  template:
    '<DialogHandler dialog="whakapapa-edit" :view="whakapapaView"/>',
  data () {
    return {
      whakapapaView: viewMinimum
    }
  },
  components: { DialogHandler }
})

export const ShowWhakapapaDeleteDialog = () => ({
  template:
    '<DialogHandler dialog="whakapapa-delete" :view="whakapapaView"/>',
  data () {
    return {
      whakapapaView: viewMinimum
    }
  },
  components: { DialogHandler }
})
