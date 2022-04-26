<template>
  <v-icon :class='styleClasses'>
    mdi-account-multiple
  </v-icon>
</template>

<script>
export default {
  name: 'WhakapapaIcon',
  props: {
    size: String,
    color: String
  },
  computed: {
    styleClasses () {
      return [this.size, this.color].map(val => val && `is-${val}`)
    }
  }
}
</script>
