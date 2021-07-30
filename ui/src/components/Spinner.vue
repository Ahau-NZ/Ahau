<template>
  <v-overlay opacity="0.8" :value="loadingState">
    <v-progress-circular :value="value" indeterminate size="64" color="#b12526">
      {{ label }}
    </v-progress-circular>
  </v-overlay>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Spinner',
  computed: {
    ...mapGetters(['loadingState']),
    label () {
      if (typeof this.loadingState === 'boolean') return ''

      return this.loadingState + ' %'
    },
    value () {
      if (typeof this.loadingState === 'boolean') return null
      return this.loadingState
    }
  }
}
</script>
