import WhakapapaForm from './WhakapapaForm.vue'
import { viewMinimum } from '@/mocks/whakapapa-view'

export default {
  title: 'WhakapapaForm'
}

export const ViewWhakapapaForm = () => ({
  template: '<WhakapapaForm :view="view" :readonly="true"/>',
  data () {
    return {
      view: viewMinimum
    }
  },
  components: { WhakapapaForm }
})

export const EditWhakapapaForm = () => ({
  template: '<WhakapapaForm :view="view"/>',
  data () {
    return {
      view: viewMinimum
    }
  },
  components: { WhakapapaForm }
})

export const NewWhakapapaForm = () => ({
  template: '<ProfileForm />',
  components: { WhakapapaForm }
})
