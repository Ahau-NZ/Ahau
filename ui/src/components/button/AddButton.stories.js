import AddButton from './AddButton.vue'

export default {
  title: 'AddButton'
}

export const NoProps = () => ({
  template: '<AddButton />',
  components: { AddButton }
})

export const Label = () => ({
  template: '<AddButton label="Add description" row/>',
  components: { AddButton }
})
