<template>
  <v-overlay opacity="0.8" :value="loadingState" >
    <v-progress-circular indeterminate size="64" color="#b12526"></v-progress-circular>
  </v-overlay>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['loadingState'])
  }
}
</script>
