<template>
  <v-overlay opacity="0.8" :value="loadingState" :z-index="1">
    <v-progress-circular
      :value="value"
      indeterminate
      size="84"
      width="6"
      color="#b12526"
      style="filter: drop-shadow(0 0 6px rgba(0,0,0,0.4));"
      >
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

      return this.loadingState
    },
    value () {
      if (typeof this.loadingState === 'boolean') return null
      return this.loadingState
    }
  }
}
</script>
