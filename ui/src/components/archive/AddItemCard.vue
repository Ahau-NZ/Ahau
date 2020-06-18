<template>
  <div>
    <AddButton :label="label"/>
    <slot name="content"></slot>
  </div>
</template>

<script>
import AddButton from '@/components/button/AddButton.vue'

export default {
  name: 'AddItemCard',
  props: {
    label: String
  },
  components: {
    AddButton
  }
}
</script>
