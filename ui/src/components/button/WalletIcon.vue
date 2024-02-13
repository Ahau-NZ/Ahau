<template>
  <v-icon v-bind="customProps">
    mdi-card-account-details
  </v-icon>
</template>

<script>
export default {
  name: 'WalletIcon',
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
