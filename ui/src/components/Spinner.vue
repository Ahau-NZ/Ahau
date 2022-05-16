<template>
  <v-overlay opacity="0.8" :value="loadingState" :z-index="1">
    <v-progress-circular
      :value="value"
      :indeterminate="isBoolean"
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
  name: 'LoadingSpinner',
  computed: {
    ...mapGetters(['loadingState']),
    isBoolean () {
      return typeof this.loadingState === 'boolean'
    },
    label () {
      if (this.isBoolean) return ''
      return this.loadingState + '%'
    },
    value () {
      if (this.isBoolean) return null
      return this.loadingState
    }
  }
}
</script>
