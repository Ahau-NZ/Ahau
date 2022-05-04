<template>
  <v-icon v-bind="customProps" >
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
    customProps () {
      return {
        [this.size]: true,
        color: this.color
      }
    }
  }
}
</script>
